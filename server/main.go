package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	env1 "github.com/codingconcepts/env"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	_ "github.com/joho/godotenv/autoload"
	rotatelogs "github.com/lestrrat-go/file-rotatelogs"
	"github.com/sirupsen/logrus"
)

// EnvConfig
type EnvConfig struct {
	Tag            string   `env:"TAG" required:"true"`
	Port           string   `env:"PORT" required:"true"`
	CheckLoginURL  string   `env:"CHECK_LOGIN_URL" required:"true"`
	Port0          string   `env:"PORT0"`
	APIProxyConfig []string `env:"API_PROXY_CONFIG" delimiter:";"`
	APITimeout     int64    `env:"API_TIMEOUT"`
	StaticDir      string   `env:"STATIC_DIR" required:"true"`
	LogPath        string   `env:"LOG_PATH" required:"true"`
}

var (

	// envConfig
	envConfig *EnvConfig

	// logger
	logger *logrus.Logger

	htmlPageMapping map[string]string
)

func init() {
	envConfig = &EnvConfig{}
	if err := env1.Set(envConfig); err != nil {
		panic(fmt.Errorf("parse env file error: %s", err.Error()))
	}
	if len(envConfig.Port0) > 0 {
		envConfig.Port = envConfig.Port0
	}
	logger = logrus.New()
	logger.SetFormatter(&logrus.JSONFormatter{})

	logPath := fmt.Sprintf("%s/%s.api.log", envConfig.LogPath, "%Y-%m-%d_%H")
	writer, err := rotatelogs.New(logPath,
		rotatelogs.WithMaxAge(30*24*time.Hour),
		rotatelogs.WithRotationTime(time.Hour),
	)
	if err != nil {
		panic(fmt.Sprintf("new rotatelogs error: %s", err.Error()))
	}
	logger.SetOutput(writer)
	htmlPageMapping = getHTMLFileMapping(envConfig.StaticDir)
}

func main() {
	router := gin.Default()
	if envConfig.Tag == "develop" {
		router.Use(crossDomain())
	}
	registerHealthcheck(router)
	router.Use(checkLogin, addTag)

	for _, item := range envConfig.APIProxyConfig {
		if parts := strings.Split(item, "@"); len(parts) >= 2 {
			router.Any(fmt.Sprintf("%s/*urlpath", parts[0]), genAPIProxy(parts[1]))
		}
	}
	for path := range htmlPageMapping {
		router.GET(path, htmlHandler)
	}
	router.NoRoute(createStaticHandler(http.Dir(envConfig.StaticDir)))

	router.Run(":" + envConfig.Port)
}

// crossDomain  for development
//
//	@param hosts
//	@return gin.HandlerFunc

func crossDomain() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Header("Access-Control-Allow-Origin", "http://localhost:3000")
		ctx.Header("Access-Control-Allow-Headers", "Content-Type,AccessToken,X-CSRF-Token,Authorization,Token,Environment,admin-token,test-admin-token")
		ctx.Header("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT, OPTIONS")
		ctx.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Content-Type")
		ctx.Header("Access-Control-Allow-Credentials", "true")
		if ctx.Request.Method == "OPTIONS" {
			ctx.String(200, "OPTIONS Request")
			ctx.Abort()
			return
		}
	}
}

func addTag(ctx *gin.Context) {
	if strings.HasSuffix(ctx.Request.URL.Path, ".html") || ctx.Request.URL.Path == "/" {
		ctx.SetCookie("tag", envConfig.Tag, 3600*24*365, "/", ctx.Request.Host, false, false)
	}
}

func genAPIProxy(proxy string) gin.HandlerFunc {
	return func(ctx *gin.Context) {

		timeout := time.Second * 10
		if envConfig.APITimeout > 0 {
			timeout = time.Second * time.Duration(envConfig.APITimeout)
		}
		client := &http.Client{
			Timeout: timeout,
		}
		fullURL := getFullPath(ctx, proxy)
		requestBody := getRequestBody(ctx)

		request, err := http.NewRequest(ctx.Request.Method, fullURL, requestBody)
		logAPI(ctx, map[string]interface{}{
			"proxy_url": fullURL,
			"method":    ctx.Request.Method,
		})

		for key, value := range ctx.Request.Header {
			request.Header.Add(key, strings.Join(value, ""))
		}
		if err != nil {
			ctx.AbortWithError(200, fmt.Errorf("new request with error: %v", err.Error()))
			return
		}
		response, err := client.Do(request)
		if err != nil {
			ctx.AbortWithError(200, fmt.Errorf("response error: %v", err.Error()))
			return
		}

		bytes, err := io.ReadAll(response.Body)
		logAPI(ctx, map[string]interface{}{
			"proxy_url":     fullURL,
			"method":        ctx.Request.Method,
			"response_body": string(bytes),
			"header":        response.Header,
		})
		if err != nil {
			ctx.AbortWithError(200, fmt.Errorf("read response error: %v", err.Error()))
			return
		}
		for key, values := range response.Header {
			if strings.ToLower(key) == "content-length" {
				continue
			}
			for _, value := range values {
				if strings.ToLower(key) == "set-cookie" {
					ctx.Writer.Header().Add(key, value)
				} else {
					ctx.Writer.Header().Set(key, value)
				}
			}
		}

		var jsonData interface{}

		if err := json.Unmarshal(bytes, &jsonData); err == nil {
			ctx.JSON(http.StatusOK, jsonData)
		} else {
			ctx.String(http.StatusOK, string(bytes))
		}
	}
}

func getFullPath(ctx *gin.Context, proxy string) string {
	fullPath := proxy + ctx.Param("urlpath")
	if len(ctx.Request.URL.RawQuery) > 0 {
		fullPath = fullPath + "?" + ctx.Request.URL.RawQuery
	}
	return fullPath
}

// getRequestBody
//
//	@param ctx
//	@return io.Reader
func getRequestBody(ctx *gin.Context) io.Reader {
	if ctx.Request.Method == http.MethodGet {
		return nil
	}

	bytes, err := ctx.GetRawData()
	if err == nil {
		logAPI(ctx, map[string]interface{}{
			"post_body": string(bytes),
		})
		return strings.NewReader(string(bytes))
	}
	return nil
}

func logAPI(ctx *gin.Context, extra map[string]interface{}) {
	data := map[string]interface{}{
		"url":   ctx.Request.URL.String(),
		"extra": extra,
	}
	headers := make(map[string]string)
	for k, v := range ctx.Request.Header {
		headers[k] = strings.Join(v, ",")
	}
	data["header"] = headers

	if raw, err := ctx.GetRawData(); err == nil {
		ctx.Request.Body = io.NopCloser(bytes.NewBuffer(raw))
		data["body"] = string(raw)
	}

	logger.WithFields(logrus.Fields(data)).Info("api")

}

func registerHealthcheck(router *gin.Engine) {
	router.GET("/healthcheck", func(ctx *gin.Context) {
		HealthCheck(ctx.Writer, ctx.Request)
		ctx.Abort()
	})
	router.HEAD("/healthcheck", func(ctx *gin.Context) {
		HealthCheck(ctx.Writer, ctx.Request)
		ctx.Abort()
	})
	router.POST("/healthcheck/start", func(ctx *gin.Context) {
		HealthCheckStart(ctx.Writer, ctx.Request)
		ctx.Abort()
	})
	router.POST("/healthcheck/shutdown", func(ctx *gin.Context) {
		HealthCheckShutdown(ctx.Writer, ctx.Request)
		ctx.Abort()
	})
}

// htmlHandler
//
//	@param ctx
func htmlHandler(ctx *gin.Context) {
	path := strings.TrimLeft(ctx.Request.URL.Path, "/")
	if _, ok := htmlPageMapping[path]; !ok {
		ctx.Writer.WriteHeader(http.StatusNotFound)
		ctx.Abort()
		return
	}
	bytes, err := os.ReadFile(htmlPageMapping[path])
	if err != nil {
		ctx.Data(http.StatusOK, binding.MIMEHTML, []byte(err.Error()))
		ctx.Status(http.StatusInternalServerError)
		ctx.Abort()
		return
	}
	ctx.Data(http.StatusOK, binding.MIMEHTML, bytes)

}

func createStaticHandler(fs http.FileSystem) gin.HandlerFunc {
	fileServer := http.StripPrefix("", http.FileServer(fs))
	return func(ctx *gin.Context) {
		/*
			file := strings.TrimLeft(ctx.Request.URL.Path, "/")
			f, err := fs.Open(file)
			if err != nil {
				ctx.Writer.WriteHeader(http.StatusNotFound)
				ctx.Abort()
				return
			}
			f.Close()
		*/
		fileServer.ServeHTTP(ctx.Writer, ctx.Request)
	}
}

// LoginUser
type LoginUser struct {
	Code   int    `json:"code"`
	Status string `json:"status"`
	Data   struct {
		LoginURL string `json:"login_url"`
	} `json:"data"`
}

func noCheckLogin(currentURL string) bool {
	if strings.Contains(currentURL, "login") || strings.Contains(currentURL, "logout") {
		return true
	}

	if strings.HasSuffix(currentURL, ".css") || strings.HasSuffix(currentURL, ".js") {
		return true
	}
	return false
}

func checkLogin(ctx *gin.Context) {
	currentURL := ctx.Request.URL.String()
	if noCheckLogin(currentURL) {
		ctx.Next()
		return
	}
	client := &http.Client{
		Timeout: time.Second * 5,
	}
	request, _ := http.NewRequest(http.MethodGet, envConfig.CheckLoginURL, nil)
	logAPI(ctx, map[string]interface{}{
		"proxy_url": envConfig.CheckLoginURL,
		"method":    http.MethodGet,
	})

	for key, value := range ctx.Request.Header {
		request.Header.Add(key, strings.Join(value, ""))
	}
	response, err := client.Do(request)
	if err != nil {
		ctx.AbortWithError(200, errors.New("get login user error"))
		return
	}

	bytes, _ := io.ReadAll(response.Body)
	logAPI(ctx, map[string]interface{}{
		"proxy_url":     envConfig.CheckLoginURL,
		"method":        http.MethodGet,
		"response_body": string(bytes),
		"header":        response.Header,
	})
	user := &LoginUser{}
	if err := json.Unmarshal(bytes, user); err != nil {
		ctx.AbortWithError(200, fmt.Errorf("get login user error:%s", err.Error()))
		return
	}
	if user.Code == -100 {
		ctx.Redirect(http.StatusTemporaryRedirect, user.Data.LoginURL)
		ctx.Abort()
		return
	}
	if user.Code < 0 {
		ctx.AbortWithError(200, fmt.Errorf("get login user error: %s", user.Status))
	}
}

func getHTMLFileMapping(path string) map[string]string {
	retData := map[string]string{}
	filepath.Walk(path, func(tmpPath string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if filepath.Clean(path) == filepath.Clean(tmpPath) {
			return nil
		}
		if info.IsDir() {
			return nil
		}
		if strings.HasSuffix(info.Name(), ".html") {
			val, _ := filepath.Rel(path, tmpPath)
			retData[strings.TrimSuffix(val, ".html")] = tmpPath
		}
		return nil
	})

	return retData
}
