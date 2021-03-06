package io.choerodon.agile.infra.dto;

import java.math.BigDecimal;

/**
 * Created by jian_zhang02@163.com on 2018/5/30.
 */
public class IssueCountDTO {
    private Long id;
    private String name;
    private Integer issueCount;
    private BigDecimal storyPointCount;
    private BigDecimal successStoryPoint;
    private BigDecimal totalStoryPoint;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getIssueCount() {
        return issueCount;
    }

    public void setIssueCount(Integer issueCount) {
        this.issueCount = issueCount;
    }

    public void setStoryPointCount(BigDecimal storyPointCount) {
        this.storyPointCount = storyPointCount;
    }

    public BigDecimal getStoryPointCount() {
        return storyPointCount;
    }

    public BigDecimal getSuccessStoryPoint() {
        return successStoryPoint;
    }

    public void setSuccessStoryPoint(BigDecimal successStoryPoint) {
        this.successStoryPoint = successStoryPoint;
    }

    public BigDecimal getTotalStoryPoint() {
        return totalStoryPoint;
    }

    public void setTotalStoryPoint(BigDecimal totalStoryPoint) {
        this.totalStoryPoint = totalStoryPoint;
    }
}
