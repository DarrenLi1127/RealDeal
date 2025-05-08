package com.realdeal.backend.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class RedisConfig {

  @Bean(name = "cacheManager")
  @Primary
  public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
    ObjectMapper redisMapper = new ObjectMapper();
    redisMapper.registerModule(new JavaTimeModule());

    // Configure visibility and type handling
    redisMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
    redisMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    redisMapper.activateDefaultTyping(
        LaissezFaireSubTypeValidator.instance,
        ObjectMapper.DefaultTyping.NON_FINAL,
        JsonTypeInfo.As.PROPERTY);

    GenericJackson2JsonRedisSerializer serializer =
        new GenericJackson2JsonRedisSerializer(redisMapper);

    // Default configuration with 10 minutes TTL
    RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
        .entryTtl(Duration.ofMinutes(10))
        .disableCachingNullValues()
        .serializeValuesWith(
            RedisSerializationContext.SerializationPair.fromSerializer(serializer));

    // Cache-specific TTL settings
    Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

    // Common read data, longer TTL (30 mins)
    cacheConfigurations.put("postsCount", defaultConfig.entryTtl(Duration.ofMinutes(30)));
    cacheConfigurations.put("allPosts", defaultConfig.entryTtl(Duration.ofMinutes(30)));
    cacheConfigurations.put("singlePost", defaultConfig.entryTtl(Duration.ofMinutes(30)));

    // User specific data, medium TTL (15 mins)
    cacheConfigurations.put("userPosts", defaultConfig.entryTtl(Duration.ofMinutes(15)));
    cacheConfigurations.put("postLikes", defaultConfig.entryTtl(Duration.ofMinutes(15)));
    cacheConfigurations.put("postStars", defaultConfig.entryTtl(Duration.ofMinutes(15)));
    cacheConfigurations.put("commentLikes", defaultConfig.entryTtl(Duration.ofMinutes(15)));

    // Frequently changing data, shorter TTL (5 mins)
    cacheConfigurations.put("postsContent", defaultConfig.entryTtl(Duration.ofMinutes(5)));
    cacheConfigurations.put("topLevelComments", defaultConfig.entryTtl(Duration.ofMinutes(5)));
    cacheConfigurations.put("allComments", defaultConfig.entryTtl(Duration.ofMinutes(5)));

    return RedisCacheManager.builder(factory)
        .cacheDefaults(defaultConfig)
        .withInitialCacheConfigurations(cacheConfigurations)
        .build();
  }
}