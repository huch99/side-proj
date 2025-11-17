import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const FormContainer = styled.div`
  margin-top: 40px;
  padding: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const FormTitle = styled.h3`
  color: #007bff;
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.5rem;
  font-weight: bold;
`;

const BidInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;

  label {
    margin-bottom: 8px;
    font-weight: bold;
    color: #333;
  }

  input {
    padding: 12px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 1.1rem;
    &:focus {
      border-color: #007bff;
      outline: none;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
  }
`;

const CurrentPriceDisplay = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 15px;
  strong {
    color: #dc3545;
    font-size: 1.3rem;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover:not(:disabled) {
    background-color: #218838;
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const Message = styled.p`
  text-align: center;
  margin-top: 15px;
  font-size: 0.95rem;
  color: ${(props) => (props.$type === 'error' ? '#dc3545' : '#28a745')};
  font-weight: ${(props) => (props.$type === 'success' ? 'bold' : 'normal')};
`;


const BidForm = ({ cltrMnmtNo, initialMinBidPrice, onBidSuccess }) => {

    const [bidPrice, setBidPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    // Redux store에서 로그인 여부와 사용자 ID 가져오기
    const { isLoggedIn, userId } = useSelector((state) => state.login);

    // 현재 최저 입찰 금액 (콤마 포맷)
    const formattedMinBidPrice = initialMinBidPrice
        ? initialMinBidPrice.toLocaleString() + '원'
        : '정보 없음';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!isLoggedIn) {
            setMessage('입찰을 위해 로그인해주세요.');
            setMessageType('error');
            return;
        }
        if (!bidPrice || bidPrice <= 0) {
            setMessage('유효한 입찰 금액을 입력해주세요.');
            setMessageType('error');
            return;
        }
        if (initialMinBidPrice && bidPrice <= initialMinBidPrice) {
            console.log("--- '입찰 금액은 최저가보다 높아야' 메시지 발생 조건 만족 ---");
            setMessage(`입찰 금액은 현재 최저 입찰가 (${formattedMinBidPrice})보다 높아야 합니다.`);
            setMessageType('error');
            return;
        }

        setLoading(true);
        try {
            // ✅ 백엔드 입찰 API 엔드포인트에 맞게 수정
            // 예: POST /api/bids, 요청 본문 { cltrMnmtNo, userId, bidPrice }
            const response = await fetch(`http://localhost:8080/api/bids`, {
                method: 'POST', // HTTP 메소드
                headers: {
                    'Content-Type': 'application/json', // JSON 형식임을 알림
                    // JWT 토큰을 포함해야 합니다.
                    // 만약 `fetchApi` 유틸리티를 사용한다면 자동으로 포함되겠지만,
                    // `fetch`를 직접 사용하므로 수동으로 Authorization 헤더를 추가해야 합니다.
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // ✅ JWT 토큰 추가
                },
                body: JSON.stringify({ // 요청 본문 (JSON 문자열로 변환)
                    cltrMnmtNo: cltrMnmtNo,
                    userId: userId, // 백엔드에서 JWT 토큰으로 userId를 얻을 수 있다면 여기선 불필요
                    bidPrice: parseInt(bidPrice, 10),
                }),
            });

            // HTTP 상태 코드를 확인하여 에러 처리
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: '서버 에러가 발생했습니다.' }));
                throw new Error(errorData.message || `HTTP 오류: ${response.status} ${response.statusText}`);
            }

            // 백엔드 응답을 JSON으로 파싱 (응답이 비어있을 수 있으므로 안전하게 처리)
            const data = response.status === 204 ? {} : await response.json();

            setMessage(data.message || '입찰이 성공적으로 접수되었습니다!');
            setMessageType('success');
            setBidPrice(''); // 입력창 비우기

            if (data.newMinBidPrice) { // 백엔드 응답의 'data' 객체 내 'newMinBidPrice' 필드 확인
                onBidSuccess(data.newMinBidPrice); // TenderDetailPage의 최저가 업데이트
            }


        } catch (error) {
            console.error("입찰 제출 오류:", error);
            setMessage(error.message || '입찰 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormContainer>
            <FormTitle>입찰하기</FormTitle>

            <CurrentPriceDisplay>
                현재 최저 입찰가: <strong>{formattedMinBidPrice}</strong>
            </CurrentPriceDisplay>

            <form onSubmit={handleSubmit}>
                <BidInputGroup>
                    <label htmlFor="bidPrice">입찰 금액 (원)</label>
                    <input
                        id="bidPrice"
                        type="number"
                        value={bidPrice}
                        onChange={(e) => setBidPrice(e.target.value)}
                        placeholder="입찰 금액을 입력하세요."
                        min={initialMinBidPrice ? initialMinBidPrice + 1 : 1} // 현재가보다 1원이라도 높게
                        required
                        disabled={loading || !isLoggedIn}
                    />
                </BidInputGroup>

                <SubmitButton type="submit" disabled={loading || !isLoggedIn}>
                    {loading ? '입찰 제출 중...' : '입찰 제출'}
                </SubmitButton>
            </form>

            {message && <Message $type={messageType}>{message}</Message>}

            {!isLoggedIn && (
                <Message $type="error">로그인 후 입찰에 참여할 수 있습니다.</Message>
            )}
        </FormContainer>
    );
};

export default BidForm;