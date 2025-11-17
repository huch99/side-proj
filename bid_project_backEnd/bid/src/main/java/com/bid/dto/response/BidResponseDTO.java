package com.bid.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidResponseDTO {

	private Long bidId;
	private Long tenderId;
	private Long userId;
	private Long bidPrice;
	private LocalDateTime bidTime;
	private String message;
	
	private Long updatedMinBidPrice;
	
	private String tenderTitle; // 입찰 공고 제목
	private String cltrMnmtNo; // 물건관리번호 (상세 페이지 이동 링크에 사용)
	private String tenderStatus; // 입찰 공고 상태 (예: "입찰 진행중", "입찰 마감")
}
