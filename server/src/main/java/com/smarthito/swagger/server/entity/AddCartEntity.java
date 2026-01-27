package com.smarthito.swagger.server.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * @author yaojunguang at 2021/4/29 10:37 下午
 */

@Data
public class AddCartEntity {

    @Schema(description = "编号", requiredMode = Schema.RequiredMode.REQUIRED)
    private int itemId;

    @Schema(description = "结果", requiredMode = Schema.RequiredMode.REQUIRED)
    private String itemName;

}
