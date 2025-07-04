package com.central.organization.controller;

import com.central.organization.model.DictItem;
import com.central.organization.service.IDictItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dict/item")
public class DictItemController {
    @Autowired
    private IDictItemService dictItemService;

    @GetMapping("/list")
    public List<DictItem> list() {
        return dictItemService.list();
    }

    @GetMapping("/by-category/{categoryId}")
    public List<DictItem> byCategory(@PathVariable Long categoryId) {
        return dictItemService.lambdaQuery().eq(DictItem::getCategoryId, categoryId).list();
    }

    @PostMapping
    public boolean add(@RequestBody DictItem item) {
        return dictItemService.save(item);
    }

    @PutMapping
    public boolean update(@RequestBody DictItem item) {
        return dictItemService.updateById(item);
    }

    @DeleteMapping("/{id}")
    public boolean delete(@PathVariable Long id) {
        return dictItemService.removeById(id);
    }
} 