#!/bin/bash

# Supabase 환경변수
SUPABASE_URL="https://ayviqkbjmmydnvszwwcs.supabase.co"
SUPABASE_KEY="sb_publishable_Fv4d8Lm6qXF-c1TMHH-Wew_gIJ1Ilau"

echo "🗑️  기존 직원 데이터 삭제 중..."

# 기존 데이터 삭제
curl -s -X DELETE \
  "${SUPABASE_URL}/rest/v1/employees?id=gt.0" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" > /dev/null

echo "✅ 기존 데이터 삭제 완료"

# 새로운 직원 데이터
employees='[
  {"id":"emp-000","name":"박상덕","email":"sdpark@welconsystems.com","password":"1234","color_index":0,"role":"user"},
  {"id":"emp-001","name":"박기덕","email":"ican6070@welconsystems.com","password":"1234","color_index":1,"role":"user"},
  {"id":"emp-002","name":"신은철","email":"ecshin@welconsystems.com","password":"1234","color_index":2,"role":"user"},
  {"id":"emp-003","name":"윤은정","email":"yej@welconsystems.com","password":"1234","color_index":3,"role":"user"},
  {"id":"emp-004","name":"강충구","email":"kcg@welconsystems.com","password":"1234","color_index":4,"role":"user"},
  {"id":"emp-005","name":"옥순권","email":"sko@welconsystems.com","password":"1234","color_index":5,"role":"user"},
  {"id":"admin-001","name":"박종미","email":"pjm@welconsystems.com","password":"admin123","color_index":-1,"role":"admin"},
  {"id":"emp-006","name":"신동관","email":"shingun@welconsystems.com","password":"1234","color_index":6,"role":"user"},
  {"id":"emp-007","name":"김소연","email":"ksy@welconsystems.com","password":"1234","color_index":7,"role":"user"},
  {"id":"emp-008","name":"강선호","email":"ksh@welconsystems.com","password":"1234","color_index":8,"role":"user"},
  {"id":"emp-009","name":"박태수","email":"pts5007@welconsystems.com","password":"1234","color_index":9,"role":"user"},
  {"id":"emp-010","name":"박석현","email":"psh@welconsystems.com","password":"1234","color_index":10,"role":"user"},
  {"id":"emp-011","name":"김요한","email":"kyh@welconsystems.com","password":"1234","color_index":11,"role":"user"}
]'

echo "➕ 새로운 직원 추가 중..."

# 새 데이터 추가
curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/employees" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "${employees}" > /dev/null

echo "✅ 13명의 직원이 추가되었습니다!"
