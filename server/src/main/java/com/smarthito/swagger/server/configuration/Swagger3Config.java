package com.smarthito.swagger.server.configuration;

import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.context.WebServerInitializedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.oas.annotations.EnableOpenApi;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;

import javax.annotation.Resource;
import java.net.InetAddress;

/**
 * swagger 配置
 *
 * @author yaojunguang
 */
@Slf4j
@Configuration
@EnableOpenApi
public class Swagger3Config implements ApplicationListener<WebServerInitializedEvent> {

    @Resource
    private Environment environment;

    @Bean("swaggerDocket")
    public Docket createRestApi() {
        return new Docket(DocumentationType.OAS_30).pathMapping("/")
                .apiInfo(new ApiInfoBuilder()
                        .title("Swagger3接口文档")
                        .description("上海XX信息科技有限公司")
                        .version("1.0.0")
                        .build())
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.smarthito.swagger.server.controller"))
                .build();
    }

    @SneakyThrows
    @Override
    public void onApplicationEvent(WebServerInitializedEvent event) {
        String ip = InetAddress.getLocalHost().getHostAddress();
        int port = event.getWebServer().getPort();
        log.info("\n---------------------------------------------------------\n" +
                "\tApplication is running! Swagger address is: http://{}:{}{}/swagger-ui/index.html" +
                "\n---------------------------------------------------------\n", ip, port, getPathPrefix());
    }

    private String getPathPrefix() {
        String path = environment.getProperty("server.servlet.context-path");
        if (path == null) {
            path = "";
        } else if (!path.startsWith("/")) {
            path = "/" + path;
        }
        return path;
    }

}
