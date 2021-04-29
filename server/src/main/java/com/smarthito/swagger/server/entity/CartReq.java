package com.smarthito.swagger.server.entity;

import io.swagger.annotations.ApiParam;
import lombok.Data;

/**
 * @author yaojunguang at 2021/4/29 10:35 下午
 */

@Data
public class CartReq {

    @ApiParam(value = "数量", defaultValue = "0")
    private int userId = 0;

    @ApiParam(value = "数量", required = true, defaultValue = "0")
    private String userName = "弄好的";
}
