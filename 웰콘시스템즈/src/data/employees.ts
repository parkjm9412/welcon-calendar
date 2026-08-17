export interface Employee {
  id: string
  name: string
  email: string
  site: string
  dept: string
  role: string
  rank: string
  status: 'active' | 'inactive' | 'leave'
  isAdmin: boolean
}

export const employees: Employee[] = [
  { id: 'e01', name: '박상덕', email: 'sdpark@welconsystems.com',   site: '본사',  dept: 'CEO',       role: '대표이사',     rank: '대표이사', status: 'active', isAdmin: true  },
  { id: 'e02', name: '박기덕', email: 'ican6070@welconsystems.com', site: '본사',  dept: '경영기획본부', role: '전무',         rank: '전무',     status: 'active', isAdmin: true  },
  { id: 'e03', name: '신은철', email: 'ecshin@welconsystems.com',   site: '연구소', dept: 'R&D센터',   role: '부사장',       rank: '부사장',   status: 'active', isAdmin: true  },
  { id: 'e04', name: '윤은정', email: 'yej@welconsystems.com',      site: '본사',  dept: '경영관리실',  role: '실장',         rank: '실장',     status: 'active', isAdmin: false },
  { id: 'e05', name: '강충구', email: 'kcg@welconsystems.com',      site: '본사',  dept: 'P&Q센터',    role: '센터장',       rank: '센터장',   status: 'active', isAdmin: false },
  { id: 'e06', name: '옥순권', email: 'sko@welconsystems.com',      site: '본사',  dept: 'P&Q센터',    role: '생산관리 과장', rank: '과장',     status: 'active', isAdmin: false },
  { id: 'e07', name: '박종미', email: 'pjm@welconsystems.com',      site: '본사',  dept: 'S&M센터',    role: 'CS팀장',       rank: '팀장',     status: 'active', isAdmin: false },
  { id: 'e08', name: '신동관', email: 'shingun@welconsystems.com',  site: '연구소', dept: 'R&D센터',   role: '수석연구원',   rank: '수석',     status: 'active', isAdmin: false },
  { id: 'e09', name: '김소연', email: 'ksy@welconsystems.com',      site: '연구소', dept: 'R&D센터',   role: '수석연구원',   rank: '수석',     status: 'active', isAdmin: false },
  { id: 'e10', name: '강선호', email: 'ksh@welconsystems.com',      site: '연구소', dept: 'R&D센터',   role: '선임연구원',   rank: '선임',     status: 'active', isAdmin: false },
  { id: 'e11', name: '박태수', email: 'pts5007@welconsystems.com',  site: '연구소', dept: 'R&D센터',   role: '선임연구원',   rank: '선임',     status: 'active', isAdmin: false },
  { id: 'e12', name: '박석현', email: 'psh@welconsystems.com',      site: '연구소', dept: 'R&D센터',   role: '주임연구원',   rank: '주임',     status: 'active', isAdmin: false },
  { id: 'e13', name: '김요한', email: 'kyh@welconsystems.com',      site: '본사',  dept: 'P&Q센터',    role: '사원',         rank: '사원',     status: 'active', isAdmin: false },
]

export const activeEmployees = employees.filter(e => e.status === 'active')
