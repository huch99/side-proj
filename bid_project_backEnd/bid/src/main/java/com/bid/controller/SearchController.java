package com.bid.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bid.dto.response.PagedTenderResponse;
import com.bid.service.TenderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class SearchController {
	
	private final TenderService tenderService;

	 @GetMapping("/search")
	    public ResponseEntity<PagedTenderResponse> searchTenders(
	            @RequestParam(name = "cltrNm", required = false) String cltrNm,
	            @RequestParam(name = "dpslMtdCd", required = false) String dpslMtdNm, // 엔티티 organization 필드와 매핑
	            @RequestParam(name = "sido", required = false) String sido,
	            @RequestParam(name = "sgk", required = false) String sgk,
	            @RequestParam(name = "emd", required = false) String emd,
	            @RequestParam(name = "goodsPriceFrom", required = false) String goodsPriceFrom,
	            @RequestParam(name = "goodsPriceTo", required = false) String goodsPriceTo,
	            @RequestParam(name = "openPriceFrom", required = false) String openPriceFrom, // 현재 DB 엔티티에 매핑되는 필드 없음 (향후 확장용)
	            @RequestParam(name = "openPriceTo", required = false) String openPriceTo,   // 현재 DB 엔티티에 매핑되는 필드 없음 (향후 확장용)
	            @RequestParam(name = "pbctBegnDtm", required = false) String pbctBegnDtm,   // String으로 받아서 서비스에서 파싱
	            @RequestParam(name = "pbctClsDtm", required = false) String pbctClsDtm,    // String으로 받아서 서비스에서 파싱
	            @RequestParam(name = "pageNo", defaultValue = "1") int pageNo,
	            @RequestParam(name = "numOfRows", defaultValue = "10") int numOfRows,
	            @RequestParam(name = "status", defaultValue = "1") int status
	    		) {

	        log.info("Request for search tenders with cltrNm: {}, dpslMtdCd: {}, pageNo: {}, numOfRows: {}",
	                cltrNm, dpslMtdNm, pageNo, numOfRows);
	        try {
	            PagedTenderResponse tenders = tenderService.searchTenders(
	                    cltrNm, dpslMtdNm, sido, sgk, emd,
	                    goodsPriceFrom, goodsPriceTo, openPriceFrom, openPriceTo,
	                    pbctBegnDtm, pbctClsDtm,
	                    pageNo, numOfRows, status
	            );
	            log.info("Successfully fetched search tenders. Total count: {}", tenders.getTotalCount());
	            return ResponseEntity.ok(tenders);
	        } catch (Exception e) {
	            log.error("Error searching tenders: {}", e.getMessage(), e);
	            return ResponseEntity.status(500).build();
	        }
	    }
}
