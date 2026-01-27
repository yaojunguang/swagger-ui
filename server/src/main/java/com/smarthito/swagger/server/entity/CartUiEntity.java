package com.smarthito.swagger.server.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * @author yaojunguang at 2021/4/29 10:33 下午
 */

@Data
public class CartUiEntity {

    @Schema(description = "数量", requiredMode = Schema.RequiredMode.REQUIRED)
    private int num = 1;

    @Schema(description = "列表", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<CellEntity> items;
}
