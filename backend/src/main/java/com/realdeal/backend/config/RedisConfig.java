package com.realdeal.backend.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;

@Configuration
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

    // Create Redis serializer with custom ObjectMapper
    GenericJackson2JsonRedisSerializer serializer =
        new GenericJackson2JsonRedisSerializer(redisMapper);

    // Configure Redis cache
    RedisCacheConfiguration cfg = RedisCacheConfiguration.defaultCacheConfig()
        .entryTtl(Duration.ofMinutes(10))
        .disableCachingNullValues()
        .serializeValuesWith(
            RedisSerializationContext.SerializationPair.fromSerializer(serializer));

    return RedisCacheManager.builder(factory)
        .cacheDefaults(cfg)
        .build();
  }
}