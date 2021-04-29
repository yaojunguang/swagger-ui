package com.smarthito.swagger.server.entity;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.sql.Timestamp;

/**
 * @author yaojunguang at 2021/4/29 10:33 下午
 */
@Data
public class CellEntity {

    @ApiModelProperty(value = "时间", required = true)
    private Timestamp time;

    @ApiModelProperty(value = "名称", required = true)
    private String name;
}
