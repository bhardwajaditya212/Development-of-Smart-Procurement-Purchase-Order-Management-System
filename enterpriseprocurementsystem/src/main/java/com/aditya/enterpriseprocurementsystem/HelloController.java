package com.aditya.enterpriseprocurementsystem;

import org.springframework.web.bind.annotation.*;
import com.aditya.enterpriseprocurementsystem.service.MailService;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello Aditya! Welcome to Enterprise Procurement System";
    }

    @PostMapping("/test")
    public String test(@RequestBody String data) {
        return "Data Received : " + data;
    }
    @GetMapping("/student")
    public String student() {
        return "Student API Working";
    }


}
