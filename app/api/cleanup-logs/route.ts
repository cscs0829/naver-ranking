import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // API 키 검증 (보안을 위해)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CLEANUP_API_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
      return NextResponse.json({
        success: true,
        message: '삭제할 오래된 로그가 없습니다.',
        deletedCount: 0,
        remainingCount: 0
      });
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
    
    const result = {
      success: true,
      message: '로그 정리 완료',
      deletedCount: logsToDelete,
      remainingCount: remainingCount || 0,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ 로그 정리 완료! 삭제된 로그: ${logsToDelete}개, 남은 로그: ${remainingCount || '알 수 없음'}개`);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ 로그 정리 중 오류 발생:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET 요청으로도 실행 가능 (테스트용)
export async function GET(request: NextRequest) {
  return POST(request);
}
