package com.smarthito.swagger.server.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * @author yaojunguang at 2021/4/29 10:35 下午
 */

@Data
public class CartReq {

    @Schema(description = "数量", defaultValue = "0")
    private int userId = 0;

    @Schema(description = "数量", requiredMode = Schema.RequiredMode.REQUIRED, defaultValue = "0")
    private String userName = "弄好的";
}
