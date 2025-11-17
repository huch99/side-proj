import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { checkSingleFavoriteStatus, toggleFavorite } from '../../features/tenders/tenderSlicce';
import BidForm from '../BidForm';

const DetailPageContainer = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const DetailTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 25px;
  border-bottom: 3px solid #3498db;
  padding-bottom: 15px;
  font-size: 32px;
  text-align: center;
`;

const DetailSection = styled.div`
  margin-bottom: 20px;
  padding: 15px 0;
  border-bottom: 1px dashed #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-weight: bold;
  color: #34495e;
  display: inline-block;
  width: 120px; /* 라벨 너비 고정 */
  margin-right: 15px;
`;

const DetailValue = styled.span`
  color: #555;
  font-size: 16px;
`;

const GoodsDescription = styled.div`
  background-color: #f8fafd;
  border: 1px solid #dbe9f7;
  border-radius: 8px;
  padding: 20px;
  margin-top: 25px;

  h3 {
    color: #3498db;
    margin-bottom: 15px;
    font-size: 22px;
  }

  p {
    white-space: pre-wrap; /* 줄 바꿈 유지 */
    color: #666;
    line-height: 1.8;
  }
`;

const BackButton = styled.button`
  display: block;
  width: 150px;
  margin: 30px auto 0;
  padding: 12px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #5a6268;
  }
`;

const LoadingMessage = styled.p`
  text-align: center;
  font-size: 18px;
  color: #3498db;
  margin-top: 50px;
`;

const ErrorMessage = styled.p`
  text-align: center;
  font-size: 18px;
  color: #e74c3c;
  margin-top: 50px;
`;

const FavoriteIcon = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: ${props => props.isFavorite ? '#FFD700' : '#cccccc'}; // 노란색 or 회색
  font-size: 32px; // 목록보다 크게
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

// ✅ 입찰 상태 표시를 위한 새로운 스타일 (DetailTitle과 비슷하게, 더 눈에 띄게)
const TenderStatusDisplay = styled.p`
  font-size: 1.2rem;
  font-weight: bold;
  margin: 20px auto; /* 중앙 정렬 */
  padding: 10px 15px;
  border-radius: 8px;
  text-align: center;
  color: white;
  width: fit-content; /* 내용에 맞춰 너비 조절 */
  background-color: ${props => {
    if (props.$status === 1) return '#28a745'; // Green
    if (props.$status === 2) return '#ffc107'; // Yellow
    if (props.$status === 3) return '#dc3545'; // Red
    return '#6c757d'; // Gray
  }};
`;

// ✅ "입찰하기" 버튼 스타일
const BidButton = styled.button`
  display: block;
  width: 100%;
  padding: 15px;
  margin-top: 30px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

// ✅ 입찰 불가 메시지 스타일 (BidForm을 대신하여 표시)
const DisabledBidMessage = styled.p`
  text-align: center;
  margin-top: 20px;
  padding: 15px;
  border: 1px dashed #dc3545;
  background-color: #ffebe9;
  color: #dc3545;
  font-weight: bold;
  border-radius: 5px;
`;

const TenderDetailPage = () => {
  const { cltrMnmtNo } = useParams(); // URL 파라미터에서 tenderId를 가져옴
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const favoriteTenderIds = useSelector(state => state.tenders.favoriteTenderIds);

  const [tenderDetail, setTenderDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMinBidPrice, setCurrentMinBidPrice] = useState(null);

  const bidFormRef = useRef(null);

  const isCurrentTenderFavorite = favoriteTenderIds.includes(cltrMnmtNo);

  useEffect(() => {
    const fetchTenderDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`http://localhost:8080/api/tenders/${cltrMnmtNo}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        setTenderDetail(data); // 백엔드에서 받은 TenderResponseDTO 데이터를 설정

        const processedMinBidPrice =
          (typeof data.minBidPrice  === 'number' && Number.isFinite(data.minBidPrice ))
            ? data.minBidPrice   // 이미 유효한 숫자이면 그대로 사용
            : (data.minBidPrice   != null ? parseInt(data.minBidPrice  , 10) : null);

          console.log(processedMinBidPrice);
        setCurrentMinBidPrice(processedMinBidPrice);
      } catch (err) {
        setError(err.message || '물건 상세 정보를 불러오는데 실패했습니다.');
        console.error("Failed to fetch tender detail:", err);
      } finally {
        setLoading(false);
      }
    };

    if (cltrMnmtNo) {
      fetchTenderDetail();
      dispatch(checkSingleFavoriteStatus(cltrMnmtNo));
    }
  }, [cltrMnmtNo, dispatch]);

  // ✅ "입찰하기" 버튼 클릭 핸들러 (입찰 폼으로 스크롤)
  const handleBidButtonClick = () => {
    if (bidFormRef.current) {
      bidFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); // 부드러운 스크롤
    }
  };

  const handleBidSuccess = (newBidPrice) => {
    setCurrentMinBidPrice(newBidPrice); // BidForm에서 받은 최신 최저가로 상태 업데이트
    // tenderDetail 객체도 업데이트하여 UI에 반영
    setTenderDetail(prev => ({ ...prev, minBidPrice: newBidPrice  }));
  };

  // ✅ 즐겨찾기 토글 핸들러
  const handleToggleFavorite = useCallback(() => {
    dispatch(toggleFavorite({ cltrMnmtNo: cltrMnmtNo, isFavorite: isCurrentTenderFavorite }));
  }, [dispatch, cltrMnmtNo, isCurrentTenderFavorite]);


  if (loading) return <LoadingMessage>상세 정보 로딩 중...</LoadingMessage>;
  if (error) return <ErrorMessage>오류: {error}</ErrorMessage>;
  if (!tenderDetail) return <ErrorMessage>물건 정보를 찾을 수 없습니다.</ErrorMessage>;

  // 날짜/시간 포맷팅 헬퍼 함수
  const formatDateTime = (dt) => {
    if (!dt) return 'N/A';
    try {
      const date = new Date(dt); // 백엔드에서 LocalDateTime이 문자열로 오면 Date 객체로 변환
      return date.toLocaleString();
    } catch (e) {
      return dt; // 파싱 실패 시 원본 문자열 반환
    }
  };


  return (
    <DetailPageContainer>
      <DetailTitle>{tenderDetail.tenderTitle}</DetailTitle>

      <FavoriteIcon
        isFavorite={isCurrentTenderFavorite}
        onClick={handleToggleFavorite}
      >
        <FaStar />
      </FavoriteIcon>

      {/* ✅ 입찰 상태 표시 (기존 DetailSection과 분리하여 눈에 잘 띄게) */}
      <TenderStatusDisplay $status={tenderDetail.status}>
        {tenderDetail.status === 1 ? "입찰 진행 중" : tenderDetail.status === 2 ? "입찰 예정" : "입찰 마감"}
      </TenderStatusDisplay>

      <DetailSection>
        <DetailLabel>공고번호:</DetailLabel>
        <DetailValue>{tenderDetail.pbctNo}</DetailValue>
      </DetailSection>

      <DetailSection>
        <DetailLabel>물건관리번호:</DetailLabel>
        <DetailValue>{tenderDetail.cltrMnmtNo}</DetailValue>
      </DetailSection>

      <DetailSection>
        <DetailLabel>처분방식:</DetailLabel>
        <DetailValue>{tenderDetail.organization}</DetailValue>
      </DetailSection>

      <DetailSection>
        <DetailLabel>입찰번호:</DetailLabel>
        <DetailValue>{tenderDetail.bidNumber}</DetailValue>
      </DetailSection>

      <DetailSection>
        <DetailLabel>공고일:</DetailLabel>
        <DetailValue>{formatDateTime(tenderDetail.announcementDate)}</DetailValue>
      </DetailSection>

      <DetailSection>
        <DetailLabel>입찰 마감일:</DetailLabel>
        <DetailValue>{formatDateTime(tenderDetail.deadline)}</DetailValue>
      </DetailSection>

      {/* 최초 입찰가 (initialOpenPriceFrom / initialOpenPriceTo) 추가 */}
      <DetailSection>
        <DetailLabel>최초 입찰가:</DetailLabel>
        <DetailValue>
          {/* {tenderDetail.initialOpenPriceFrom ? tenderDetail.initialOpenPriceFrom.toLocaleString() + '원' : '없음'} */}
        </DetailValue>
      </DetailSection>
      <DetailSection>
        <DetailLabel>최초 감정가 범위:</DetailLabel>
        <DetailValue>
          {/* {tenderDetail.initialOpenPriceFrom && tenderDetail.initialOpenPriceTo ?
           `${tenderDetail.initialOpenPriceFrom.toLocaleString()}원 ~ ${tenderDetail.initialOpenPriceTo.toLocaleString()}원` : '정보 없음'} */}
        </DetailValue>
      </DetailSection>

      {/* 백엔드에서 GOODS_NM 필드를 가져와야 합니다. */}
      {/* 현재 TenderResponseDTO에 GOODS_NM은 없으므로, 백엔드에서 이 필드를 추가하고 파싱해야 함 */}
      {tenderDetail.goodsName && ( // goodsName이라는 필드가 있다고 가정
        <GoodsDescription>
          <h3>물건 상세 설명</h3>
          <p>{tenderDetail.goodsName}</p>
        </GoodsDescription>
      )}

      {/* ✅ "입찰하기" 버튼 추가 */}
      <BidButton
        onClick={handleBidButtonClick}
        disabled={tenderDetail.status !== 1} // '입찰 진행중'일 때만 활성화
      >
        {tenderDetail.status === 1 ? '입찰하기' : `현재 ${tenderDetail.status === 2 ? "입찰 예정" : "입찰 마감"}으로 입찰 불가`}
      </BidButton>

      {/* ✅ 입찰 폼 또는 입찰 불가 메시지 조건부 렌더링 */}
      {tenderDetail.status === 1 ? (
        // ✅ BidForm에 ref 연결
        <div ref={bidFormRef}>
          <BidForm
            cltrMnmtNo={tenderDetail.cltrMnmtNo} // tenderId를 BidForm에 전달
            initialMinBidPrice={currentMinBidPrice} // 최신 최저 입찰가를 전달
            onBidSuccess={handleBidSuccess} // 입찰 성공 콜백 전달
          />
        </div>
      ) : (
        <DisabledBidMessage>
          현재 "{tenderDetail.status === 2 ? "입찰 예정" : "입찰 마감"}"인 공고에는 입찰할 수 없습니다.
        </DisabledBidMessage>
      )}

      <BackButton onClick={() => navigate(-1)}>뒤로 가기</BackButton>
    </DetailPageContainer>
  );
};

export default TenderDetailPage;