package com.smarthito.swagger.server.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.sql.Timestamp;

/**
 * @author yaojunguang at 2021/4/29 10:33 下午
 */
@Data
public class CellEntity {

    @Schema(description = "时间", requiredMode = Schema.RequiredMode.REQUIRED)
    private Timestamp time;

    @Schema(description = "名称", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;
}
