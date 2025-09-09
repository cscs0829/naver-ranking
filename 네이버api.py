#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
네이버 쇼핑 검색 API를 사용한 상품 순위 검색 도구
상품이 네이버 쇼핑에서 몇 페이지 몇 번째에 있는지 찾아주는 도구입니다.
"""

import requests
import json
import time
import urllib.parse
from typing import Dict, List, Optional, Tuple
import logging
import pandas as pd
from datetime import datetime
import os

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class NaverShoppingRankChecker:
    """네이버 쇼핑 검색 API를 사용하여 상품 순위를 확인하는 클래스"""
    
    def __init__(self, client_id: str, client_secret: str):
        """
        네이버 API 클라이언트 초기화
        
        Args:
            client_id (str): 네이버 개발자 센터에서 발급받은 클라이언트 ID
            client_secret (str): 네이버 개발자 센터에서 발급받은 클라이언트 시크릿
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = "https://openapi.naver.com/v1/search/shop.json"
        self.headers = {
            'X-Naver-Client-Id': client_id,
            'X-Naver-Client-Secret': client_secret
        }
        
    def search_products(self, query: str, display: int = 100, start: int = 1, sort: str = "sim") -> Dict:
        """
        네이버 쇼핑에서 상품을 검색합니다.
        
        Args:
            query (str): 검색어
            display (int): 한 번에 표시할 검색 결과 개수 (기본값: 100, 최댓값: 100)
            start (int): 검색 시작 위치 (기본값: 1, 최댓값: 1000)
            sort (str): 정렬 방법 (sim: 정확도순, date: 날짜순, asc: 가격 오름차순, dsc: 가격 내림차순)
            
        Returns:
            Dict: API 응답 데이터
        """
        params = {
            'query': query,
            'display': min(display, 100),  # 최대 100개로 제한
            'start': start,
            'sort': sort
        }
        
        try:
            response = requests.get(self.base_url, headers=self.headers, params=params)
            response.raise_for_status()
            
            # API 호출 제한을 위한 대기 (1초)
            time.sleep(1)
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"API 요청 중 오류 발생: {e}")
            return None
    
    def find_product_rank(self, search_query: str, target_product_name: str = None, 
                         target_mall_name: str = None, target_brand: str = None,
                         max_pages: int = 10) -> Optional[Dict]:
        """
        특정 상품의 순위를 찾습니다.
        
        Args:
            search_query (str): 검색어
            target_product_name (str): 찾고자 하는 상품명 (부분 일치)
            target_mall_name (str): 찾고자 하는 쇼핑몰명 (부분 일치)
            target_brand (str): 찾고자 하는 브랜드명 (부분 일치)
            max_pages (int): 최대 검색할 페이지 수
            
        Returns:
            Dict: 상품 정보와 순위 정보가 포함된 딕셔너리
        """
        logger.info(f"상품 순위 검색 시작: '{search_query}'")
        
        for page in range(1, max_pages + 1):
            start_position = (page - 1) * 100 + 1
            
            logger.info(f"페이지 {page} 검색 중... (시작 위치: {start_position})")
            
            # API 호출
            result = self.search_products(search_query, display=100, start=start_position)
            
            if not result or 'items' not in result:
                logger.warning(f"페이지 {page}에서 검색 결과를 가져올 수 없습니다.")
                continue
            
            items = result['items']
            logger.info(f"페이지 {page}에서 {len(items)}개 상품 발견")
            
            # 각 상품을 확인
            for index, item in enumerate(items):
                product_info = self._extract_product_info(item)
                
                # 상품 매칭 확인
                if self._is_target_product(product_info, target_product_name, 
                                         target_mall_name, target_brand):
                    rank_in_page = index + 1
                    total_rank = start_position + index
                    
                    logger.info(f"상품 발견! 페이지: {page}, 순위: {rank_in_page}, 전체 순위: {total_rank}")
                    
                    return {
                        'found': True,
                        'page': page,
                        'rank_in_page': rank_in_page,
                        'total_rank': total_rank,
                        'product_info': product_info,
                        'search_query': search_query
                    }
        
        logger.info("검색 결과에서 상품을 찾을 수 없습니다.")
        return {
            'found': False,
            'search_query': search_query,
            'searched_pages': max_pages
        }
    
    def _extract_product_info(self, item: Dict) -> Dict:
        """상품 정보를 추출합니다."""
        return {
            'title': item.get('title', '').replace('<b>', '').replace('</b>', ''),
            'link': item.get('link', ''),
            'image': item.get('image', ''),
            'lprice': item.get('lprice', ''),
            'hprice': item.get('hprice', ''),
            'mallName': item.get('mallName', ''),
            'productId': item.get('productId', ''),
            'productType': item.get('productType', ''),
            'brand': item.get('brand', ''),
            'maker': item.get('maker', ''),
            'category1': item.get('category1', ''),
            'category2': item.get('category2', ''),
            'category3': item.get('category3', ''),
            'category4': item.get('category4', '')
        }
    
    def _is_target_product(self, product_info: Dict, target_product_name: str = None,
                          target_mall_name: str = None, target_brand: str = None) -> bool:
        """상품이 찾고자 하는 상품인지 확인합니다."""
        matches = []
        
        if target_product_name:
            product_name_match = target_product_name.lower() in product_info['title'].lower()
            matches.append(product_name_match)
            logger.debug(f"상품명 매칭 ({target_product_name}): {product_name_match}")
        
        if target_mall_name:
            mall_match = target_mall_name.lower() in product_info['mallName'].lower()
            matches.append(mall_match)
            logger.debug(f"쇼핑몰명 매칭 ({target_mall_name}): {mall_match}")
        
        if target_brand:
            brand_match = (target_brand.lower() in product_info['brand'].lower() or 
                          target_brand.lower() in product_info['maker'].lower())
            matches.append(brand_match)
            logger.debug(f"브랜드 매칭 ({target_brand}): {brand_match}")
        
        # 모든 조건이 일치하거나, 조건이 없으면 True
        return all(matches) if matches else True
    
    def get_product_ranking_report(self, search_query: str, target_product_name: str = None,
                                 target_mall_name: str = None, target_brand: str = None,
                                 max_pages: int = 10) -> str:
        """
        상품 순위 검색 결과를 보고서 형태로 반환합니다.
        
        Returns:
            str: 검색 결과 보고서
        """
        result = self.find_product_rank(search_query, target_product_name, 
                                      target_mall_name, target_brand, max_pages)
        
        if result['found']:
            report = f"""
=== 네이버 쇼핑 상품 순위 검색 결과 ===
검색어: {result['search_query']}
상품명: {result['product_info']['title']}
쇼핑몰: {result['product_info']['mallName']}
브랜드: {result['product_info']['brand'] or result['product_info']['maker']}
가격: {result['product_info']['lprice']}원

순위 정보:
- 페이지: {result['page']}페이지
- 페이지 내 순위: {result['rank_in_page']}번째
- 전체 순위: {result['total_rank']}번째

상품 링크: {result['product_info']['link']}
"""
        else:
            report = f"""
=== 네이버 쇼핑 상품 순위 검색 결과 ===
검색어: {result['search_query']}
검색한 페이지 수: {result['searched_pages']}페이지

결과: 상품을 찾을 수 없습니다.
검색 조건을 확인하거나 더 많은 페이지를 검색해보세요.
"""
        
        return report
    
    def search_all_products_to_excel(self, search_query: str, target_mall_name: str = None, 
                                   max_pages: int = 10, filename: str = None) -> str:
        """
        검색 결과를 엑셀 파일로 저장합니다.
        
        Args:
            search_query (str): 검색어
            target_mall_name (str): 찾고자 하는 쇼핑몰명
            max_pages (int): 최대 검색할 페이지 수
            filename (str): 저장할 파일명 (없으면 자동 생성)
            
        Returns:
            str: 저장된 파일 경로
        """
        logger.info(f"엑셀 파일 생성을 위한 상품 검색 시작: '{search_query}'")
        
        all_products = []
        found_count = 0
        
        for page in range(1, max_pages + 1):
            start_position = (page - 1) * 100 + 1
            
            logger.info(f"페이지 {page} 검색 중... (시작 위치: {start_position})")
            
            # API 호출
            result = self.search_products(search_query, display=100, start=start_position)
            
            if not result or 'items' not in result:
                logger.warning(f"페이지 {page}에서 검색 결과를 가져올 수 없습니다.")
                continue
            
            items = result['items']
            logger.info(f"페이지 {page}에서 {len(items)}개 상품 발견")
            
            # 각 상품을 확인
            for index, item in enumerate(items):
                product_info = self._extract_product_info(item)
                
                # 쇼핑몰 필터링
                if target_mall_name and target_mall_name.lower() not in product_info['mallName'].lower():
                    continue
                
                rank_in_page = index + 1
                total_rank = start_position + index
                found_count += 1
                
                # 엑셀용 데이터 추가
                product_data = {
                    '순위': total_rank,
                    '페이지': page,
                    '페이지내_순위': rank_in_page,
                    '상품명': product_info['title'],
                    '쇼핑몰': product_info['mallName'],
                    '브랜드': product_info['brand'] or product_info['maker'],
                    '가격': product_info['lprice'],
                    '카테고리1': product_info['category1'],
                    '카테고리2': product_info['category2'],
                    '카테고리3': product_info['category3'],
                    '상품ID': product_info['productId'],
                    '상품링크': product_info['link'],
                    '검색어': search_query,
                    '검색일시': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
                
                all_products.append(product_data)
                logger.info(f"상품 {found_count} 발견: {product_info['title'][:30]}... (페이지 {page}, 순위 {rank_in_page})")
        
        if not all_products:
            logger.warning("검색 결과가 없습니다.")
            return None
        
        # 엑셀 파일명 생성
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{search_query}_{target_mall_name or '전체'}_{timestamp}.xlsx"
        
        # DataFrame 생성
        df = pd.DataFrame(all_products)
        
        # 엑셀 파일 저장
        try:
            df.to_excel(filename, index=False, engine='openpyxl')
            logger.info(f"엑셀 파일 저장 완료: {filename}")
            logger.info(f"총 {len(all_products)}개 상품이 저장되었습니다.")
            return os.path.abspath(filename)
        except Exception as e:
            logger.error(f"엑셀 파일 저장 중 오류 발생: {e}")
            return None

def main():
    """메인 함수 - 사용 예제 (웹 애플리케이션으로 마이그레이션됨)"""
    print("=" * 60)
    print("네이버 쇼핑 순위 검색기 - 웹 애플리케이션")
    print("=" * 60)
    print()
    print("이 Python 스크립트는 웹 애플리케이션으로 마이그레이션되었습니다.")
    print("웹 애플리케이션을 사용하려면 다음 명령어를 실행하세요:")
    print()
    print("1. 의존성 설치:")
    print("   npm install")
    print()
    print("2. 환경변수 설정:")
    print("   .env.local 파일에 네이버 API 키와 Supabase 설정 추가")
    print()
    print("3. 개발 서버 실행:")
    print("   npm run dev")
    print()
    print("4. 브라우저에서 http://localhost:3000 접속")
    print()
    print("자세한 설정 방법은 README.md 파일을 참조하세요.")
    print("=" * 60)

if __name__ == "__main__":
    main()
