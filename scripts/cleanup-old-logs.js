#!/usr/bin/env node

/**
 * 자동 로그 정리 스크립트
 * 7일 이상 된 auto_search_logs 데이터를 삭제합니다.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL와 SUPABASE_SERVICE_ROLE_KEY를 확인하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupOldLogs() {
  try {
    console.log('🧹 오래된 로그 정리 시작...');
    
    // 삭제 전 현재 상태 확인
    const { data: beforeData, error: beforeError } = await supabase
      .from('auto_search_logs')
      .select('id, created_at')
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    
    if (beforeError) {
      throw new Error(`삭제 전 데이터 조회 실패: ${beforeError.message}`);
    }
    
    const logsToDelete = beforeData?.length || 0;
    console.log(`📊 삭제 대상 로그 수: ${logsToDelete}개`);
    
    if (logsToDelete === 0) {
      console.log('✅ 삭제할 오래된 로그가 없습니다.');
      return;
    }
    
    // 7일 이상 된 로그 삭제
    const { error: deleteError } = await supabase
      .from('auto_search_logs')
      .delete()
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    
    if (deleteError) {
      throw new Error(`로그 삭제 실패: ${deleteError.message}`);
    }
    
    // 삭제 후 상태 확인
    const { count: remainingCount, error: afterError } = await supabase
      .from('auto_search_logs')
      .select('*', { count: 'exact', head: true });
    
    if (afterError) {
      console.warn(`⚠️ 삭제 후 데이터 조회 실패: ${afterError.message}`);
    }
    
    console.log(`✅ 로그 정리 완료!`);
    console.log(`📈 삭제된 로그: ${logsToDelete}개`);
    console.log(`📊 남은 로그: ${remainingCount || '알 수 없음'}개`);
    
    // 성공 알림 (선택사항)
    if (process.env.CLEANUP_WEBHOOK_URL) {
      try {
        const response = await fetch(process.env.CLEANUP_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🧹 로그 정리 완료\n삭제된 로그: ${logsToDelete}개\n남은 로그: ${remainingCount || '알 수 없음'}개`
          })
        });
        
        if (response.ok) {
          console.log('📢 성공 알림 전송 완료');
        }
      } catch (webhookError) {
        console.warn('⚠️ 웹훅 알림 전송 실패:', webhookError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 로그 정리 중 오류 발생:', error.message);
    
    // 오류 알림 (선택사항)
    if (process.env.CLEANUP_WEBHOOK_URL) {
      try {
        await fetch(process.env.CLEANUP_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `❌ 로그 정리 실패\n오류: ${error.message}`
          })
        });
      } catch (webhookError) {
        console.warn('⚠️ 오류 웹훅 전송 실패:', webhookError.message);
      }
    }
    
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  cleanupOldLogs();
}

module.exports = { cleanupOldLogs };
