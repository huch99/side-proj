package com.bid.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bid.dto.request.UserEditRequestDTO;
import com.bid.dto.response.BidResponseDTO;
import com.bid.dto.response.UserProfileResponseDTO;
import com.bid.security.CustomUserDetails;
import com.bid.service.BidService;
import com.bid.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/mypage") // 마이페이지 관련 API는 /api/mypage 접두사 사용
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

	private final UserService userService;
	
	private final BidService bidService;

	// 현재 로그인한 사용자의 프로필 정보 조회
	@GetMapping
	public ResponseEntity<UserProfileResponseDTO> getUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
		log.info("Accessing user profile for username: {}", userDetails.getUsername());
		try {
			UserProfileResponseDTO userProfile = userService.getUserProfile(userDetails.getUsername());
			return ResponseEntity.ok(userProfile);
		} catch (Exception e) {
			log.error("Error fetching user profile for {}: {}", userDetails.getUsername(), e.getMessage());
			return ResponseEntity.badRequest().build();
		}
	}

	// 사용자 정보 수정 (이메일 등)
	@PutMapping("/profile")
	public ResponseEntity<UserProfileResponseDTO> updateUserInfo(@AuthenticationPrincipal UserDetails userDetails,
			@RequestBody UserEditRequestDTO request) {
		log.info("Updating user info for username: {}", userDetails.getUsername());
		try {
			UserProfileResponseDTO updatedProfile = userService.updateUserInfo(userDetails.getUsername(), request);
			return ResponseEntity.ok(updatedProfile);
		} catch (Exception e) {
			log.error("Error updating user info for {}: {}", userDetails.getUsername(), e.getMessage());
			return ResponseEntity.badRequest().build();
		}
	}
	
	// 비밀번호 변경
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserEditRequestDTO request) { // UserUpdateRequest를 재활용하거나 별도 DTO 생성 가능
        log.info("Changing password for username: {}", userDetails.getUsername());
        try {
            userService.changePassword(userDetails.getUsername(), request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } catch (IllegalArgumentException e) {
            log.warn("Password change failed for {}: {}", userDetails.getUsername(), e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Error changing password for {}: {}", userDetails.getUsername(), e.getMessage());
            return ResponseEntity.status(500).body("비밀번호 변경 중 오류가 발생했습니다.");
        }
    }
    
    @GetMapping("/bids")
    public ResponseEntity<List<BidResponseDTO>> getMyBids(@AuthenticationPrincipal CustomUserDetails userDetails) {
        // ✅ CustomUserDetails 객체에서 바로 getUserId() 메서드를 호출합니다!
        // 이 userId는 로그인된 사용자의 고유 ID입니다.
        if (userDetails == null) {
            log.warn("인증되지 않은 사용자의 마이페이지 입찰 내역 조회 시도.");
            return ResponseEntity.status(401).build(); // 401 Unauthorized
        }

        Long userId = userDetails.getUserId(); // ✅ 여기 한 줄로 사용자 ID를 가져옵니다.
        log.info("사용자 {}의 마이페이지 입찰 내역 조회 요청.", userId);

        try {
            List<BidResponseDTO> myBids = bidService.getMyBids(userId);
            log.info("사용자 {}의 입찰 내역 {}개 조회 완료.", userId, myBids.size());
            return ResponseEntity.ok(myBids);
        } catch (IllegalArgumentException e) {
            log.warn("사용자 {}의 입찰 내역 조회 중 오류 발생: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            log.error("사용자 {}의 입찰 내역 조회 중 서버 오류 발생: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }
}
