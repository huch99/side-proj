package com.bid.dto.response;

import lombok.Data;

@Data
public class TenderSearchResponseDTO {

	private String cltrNm;
    private String dpslMtdNm; // 엔티티 organization 필드와 매핑
    private String sido;
    private String sgk;
    private String emd;
    private String goodsPriceFrom;
    private String goodsPriceTo;
    private String openPriceFrom; // 현재 DB 엔티티에 매핑되는 필드 없음 (향후 확장용)
    private String openPriceTo;   // 현재 DB 엔티티에 매핑되는 필드 없음 (향후 확장용)

    private String pbctBegnDtm;
    private String pbctClsDtm;

    private int pageNo = 1;
    private int numOfRows = 10;
    private int status = 1;
    
}
