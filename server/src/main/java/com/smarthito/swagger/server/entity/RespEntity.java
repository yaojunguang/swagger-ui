package com.smarthito.swagger.server.entity;

/**
 * @author yaojunguang at 2021/4/29 10:31 下午
 */

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 通用数据返回封装
 *
 * @author yaojunguang
 */

@Data
public class RespEntity<T> {


    @ApiModelProperty(value = "执行结果的状态", required = true)
    public int code = 0;

    @ApiModelProperty(value = "附加消息,以code为准，返回信息不一定完整", required = true)
    public String message = "ok";


    @ApiModelProperty(value = "正常返回的数据体,若执行失败该部分会为null，若无数据为空[]", required = false)
    public T data;

}
