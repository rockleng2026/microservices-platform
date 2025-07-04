package com.central.organization.controller;

import com.central.organization.model.DictCategory;
import com.central.organization.service.IDictCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dict/category")
public class DictCategoryController {
    @Autowired
    private IDictCategoryService dictCategoryService;

    @GetMapping("/list")
    public List<DictCategory> list() {
        return dictCategoryService.list();
    }

    @PostMapping
    public boolean add(@RequestBody DictCategory category) {
        return dictCategoryService.save(category);
    }

    @PutMapping
    public boolean update(@RequestBody DictCategory category) {
        return dictCategoryService.updateById(category);
    }

    @DeleteMapping("/{id}")
    public boolean delete(@PathVariable Long id) {
        return dictCategoryService.removeById(id);
    }
} 