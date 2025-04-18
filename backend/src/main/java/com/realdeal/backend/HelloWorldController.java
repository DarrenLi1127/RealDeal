package com.realdeal.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloWorldController{

  @GetMapping(path = "/hello")
  public String sayHello(){
    return "Hello World";
  }

  @GetMapping(path = "/")
  public String root() {
    return "兄弟们开搞!!!!!";
  }
}
