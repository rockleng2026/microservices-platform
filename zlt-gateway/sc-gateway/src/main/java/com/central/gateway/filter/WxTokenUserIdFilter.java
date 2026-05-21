package com.central.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 网关过滤器：从自定义格式 Authorization header (WX_<userId>_<hex>, TOKEN_<userId>_<hex>) 中提取 userId，
 * 并设置 x-user-id header 传递给下游服务
 *
 * Token格式: WX_<userId>_<32位hex>  例如: WX_19_a1b2c3d4e5f6789012345678abcdef00
 *            TOKEN_<userId>_<32位hex>
 */
@Slf4j
@Component
public class WxTokenUserIdFilter implements GlobalFilter, Ordered {

    // 匹配 WX_<userId>_<32位hex> 或 TOKEN_<userId>_<32位hex>
    private static final Pattern WX_TOKEN_PATTERN = Pattern.compile("^WX_(\\d+)_[a-f0-9]{32}$", Pattern.CASE_INSENSITIVE);
    private static final Pattern TOKEN_TOKEN_PATTERN = Pattern.compile("^TOKEN_(\\d+)_[a-f0-9]{32}$", Pattern.CASE_INSENSITIVE);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // 忽略认证相关的路径，避免循环
        if (path.contains("/auth/") || path.contains("/api-mall/auth/") || path.contains("/api-mall/passport/")) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");

        if (authHeader != null) {
            String trimmedToken = authHeader.trim();
            String userId = extractUserId(trimmedToken);

            if (userId != null) {
                log.debug("WxTokenUserIdFilter: token={}, extracted userId={}", trimmedToken, userId);
                ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                        .header("x-user-id", userId)
                        .build();
                exchange = exchange.mutate().request(mutatedRequest).build();
            }
        }

        return chain.filter(exchange);
    }

    private String extractUserId(String token) {
        Matcher wxMatcher = WX_TOKEN_PATTERN.matcher(token);
        if (wxMatcher.matches()) {
            return wxMatcher.group(1);
        }

        Matcher tokenMatcher = TOKEN_TOKEN_PATTERN.matcher(token);
        if (tokenMatcher.matches()) {
            return tokenMatcher.group(1);
        }

        return null;
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 100;
    }
}