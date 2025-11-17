import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import React from 'react';

export const fetchMyBids = createAsyncThunk(
  'myBids/fetchMyBids',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('accessToken'); // ✅ JWT 토큰 가져오기

      if (!accessToken) {
        // 토큰이 없으면 로그인 필요 에러 반환
        return rejectWithValue('로그인 세션이 만료되었거나 토큰이 없습니다. 다시 로그인해주세요.');
      }

      // ✅ fetch 함수 호출 방식 수정
      const response = await fetch('http://localhost:8080/api/mypage/bids', {
        method: 'GET', // GET 요청은 method 필드를 생략해도 되지만 명시적으로 작성하는 것이 좋습니다.
        headers: {
          'Authorization': `Bearer ${accessToken}`, // ✅ 인증 헤더 추가
          'Content-Type': 'application/json', // 백엔드가 JSON 응답을 기대하는 경우
        },
      });

      if (!response.ok) { // HTTP 상태 코드가 2xx가 아닐 경우
        const errorData = await response.json().catch(() => ({ message: '서버 에러가 발생했습니다.' }));
        throw new Error(errorData.message || `HTTP 오류: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json(); // 응답 데이터를 JSON으로 파싱
      return data; // List<BidResponseDTO> 반환
    } catch (error) {
      console.error("내 입찰 내역 가져오기 실패:", error);
      const errorMessage = error.message || '내 입찰 내역을 가져오는데 실패했습니다.';
      return rejectWithValue(errorMessage);
    }
  }
);


const myBidsSlice = createSlice({
  name: 'myBids',
  initialState: {
    items: [], // 사용자의 입찰 내역 (BidResponseDTO 객체들의 배열)
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,    // 에러 메시지
  },
  reducers: {
    // MyPage 컴포넌트 언마운트 시 또는 재시작 시 상태를 초기화
    resetMyBidsStatus: (state) => {
      state.status = 'idle';
      state.error = null;
      state.items = []; // 입찰 내역도 비워줌
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchMyBids 비동기 액션이 실행될 때
      .addCase(fetchMyBids.pending, (state) => {
        state.status = 'loading';
        state.error = null; // 새로운 요청 시작 시 에러 초기화
      })
      // fetchMyBids 비동기 액션이 성공적으로 완료될 때
      .addCase(fetchMyBids.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload; // API 응답 데이터 (List<BidResponseDTO>)로 입찰 내역 업데이트
      })
      // fetchMyBids 비동기 액션이 실패했을 때
      .addCase(fetchMyBids.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // rejectWithValue에서 넘어온 에러 메시지
        state.items = []; // 실패 시 목록 비움
      });
  },
});

export const { resetMyBidsStatus } = myBidsSlice.actions; // 리듀서 액션 내보내기
export default myBidsSlice.reducer; // 슬라이스 리듀서 내보내기