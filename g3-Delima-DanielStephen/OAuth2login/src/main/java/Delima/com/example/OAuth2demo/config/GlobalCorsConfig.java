package Delima.com.example.OAuth2demo.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class GlobalCorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Allow CORS for all /api/** endpoints
                .allowedOrigins("https://tripsyncspp2-hhlaycpju-daniels-projects-19c8a190.vercel.app/") // Frontend origin
                .allowedMethods("GET", "POST", "PUT", "DELETE") // Allow HTTP methods
                .allowedHeaders("*") // Allow all headers
                .allowCredentials(true); // Allow cookies and credentials
    }
}
