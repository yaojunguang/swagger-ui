package com.smarthito.swagger.server.configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import jakarta.annotation.Resource;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.context.WebServerInitializedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.net.InetAddress;

/**
 * swagger 配置
 *
 * @author yaojunguang
 */
@Slf4j
@Configuration
public class Swagger3Config implements ApplicationListener<WebServerInitializedEvent> {

    @Resource
    private Environment environment;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info().title("JO API")
                        .contact(new Contact())
                        .description("JO管理平台提供的 RESTful API")
                        .version("v8.0.0")
                        .license(new License().name("Apache 2.0").url("http://springdoc.org")))
                ;
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
