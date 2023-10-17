package com.smarthito.swagger.server.controller;

import com.smarthito.swagger.server.entity.AddCartEntity;
import com.smarthito.swagger.server.entity.CartReq;
import com.smarthito.swagger.server.entity.CartUiEntity;
import com.smarthito.swagger.server.entity.RespEntity;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * @author yaojunguang at 2021/4/29 10:29 下午
 */
@RestController
@Api(tags = {"07、购物车"})
@RequestMapping(value = "/v8/cart")
public class ApiController {

    @ApiOperation(value = "获取购物车详情", notes = "购物车-详情")
    @GetMapping(value = "")
    public RespEntity<CartUiEntity> findUseCart(@ApiParam(value = "数量", defaultValue = "0", required = true)
                                                @RequestParam(required = true) int userId2, CartReq req) {
        return new RespEntity<>();
    }

    @ApiOperation(value = "添加商品", notes = "购物车-详情")
    @PostMapping(value = "")
    public RespEntity<CartUiEntity> modify(@RequestBody AddCartEntity req) {
        return new RespEntity<>();
    }

    @ApiOperation(value = "上传文件", notes = "购物车-详情")
    @PostMapping(value = "/file")
    public RespEntity<CartUiEntity> uploadFile(@RequestBody AddCartEntity req,
                                               @RequestHeader("x-tenant-id") String tenantId,
                                               @RequestPart("file") MultipartFile file) {
        return new RespEntity<>();
    }

    @ApiOperation(value = "上传文件多个", notes = "购物车-详情")
    @PostMapping(value = "/files")
    public RespEntity<CartUiEntity> uploadFiles(@RequestHeader("x-tenant-id") String tenantId,
                                                @RequestPart("file") MultipartFile[] files) {
        return new RespEntity<>();
    }
}
