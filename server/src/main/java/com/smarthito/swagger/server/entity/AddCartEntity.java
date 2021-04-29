package com.smarthito.swagger.server.entity;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author yaojunguang at 2021/4/29 10:37 下午
 */

@Data
public class AddCartEntity {

    @ApiModelProperty(value = "编号", required = true)
    private int itemId;

    @ApiModelProperty(value = "结果", required = true)
    private String itemName;

}
