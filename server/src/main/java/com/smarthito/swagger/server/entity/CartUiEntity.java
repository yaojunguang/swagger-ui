package com.smarthito.swagger.server.entity;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

/**
 * @author yaojunguang at 2021/4/29 10:33 下午
 */

@Data
public class CartUiEntity {

    @ApiModelProperty(value = "数量", required = true)
    private int num = 1;

    @ApiModelProperty(value = "列表", required = true)
    private List<CellEntity> items;
}
