package com.smarthito.swagger.server.entity;

/**
 * @author yaojunguang at 2021/4/29 10:31 下午
 */

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 通用数据返回封装
 *
 * @author yaojunguang
 */

@Data
public class RespEntity<T> {


    @Schema(description = "执行结果的状态", requiredMode = Schema.RequiredMode.REQUIRED)
    public int code = 0;

    @Schema(description = "附加消息,以code为准，返回信息不一定完整", requiredMode = Schema.RequiredMode.REQUIRED)
    public String message = "ok";


    @Schema(description = "正常返回的数据体,若执行失败该部分会为null，若无数据为空[]")
    public T data;

}
