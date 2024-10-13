'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface TeamMember {
  id: number
  name: string
  department: string
  position: string
  status: 'WFH' | 'Office'
}

const ManagerTeamScheduleView: React.FC = () => {
  const { data: session, status } = useSession()
  const [date, setDate] = useState<Date>(new Date())
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([])
  const [nameFilter, setNameFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'wfh' | 'office'>('all')

  useEffect(() => {
    if (session?.user?.id) {
      fetchTeamMembers(session.user.id, date)
    }
  }, [session, date])

  useEffect(() => {
    filterMembers()
  }, [teamMembers, nameFilter, statusFilter])

  const fetchTeamMembers = async (managerId: string, date: Date) => {
    try {
      const response = await fetch(`/api/manager-team-schedule?managerId=${managerId}&date=${format(date, 'yyyy-MM-dd')}`)
      if (response.ok) {
        const data = await response.json()
        setTeamMembers(data)
      } else {
        console.error('Failed to fetch team members')
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }

  const filterMembers = () => {
    let filtered = teamMembers

    if (nameFilter) {
      filtered = filtered.filter(member => member.name.toLowerCase().includes(nameFilter.toLowerCase()))
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => 
        (statusFilter === 'wfh' && member.status === 'WFH') || 
        (statusFilter === 'office' && member.status === 'Office')
      )
    }

    setFilteredMembers(filtered)
  }

  const getAggregatedManpower = () => {
    const wfhCount = filteredMembers.filter(member => member.status === 'WFH').length
    const officeCount = filteredMembers.filter(member => member.status === 'Office').length
    return { wfhCount, officeCount }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session || session.user.role_id !== 3) {
    return <div>You do not have permission to view this page.</div>
  }

  const { wfhCount, officeCount } = getAggregatedManpower()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Team Schedule</span>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Filter by name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="w-64"
          />
          <Select value={statusFilter} onValueChange={(value: 'all' | 'wfh' | 'office') => setStatusFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="wfh">Work from Home</SelectItem>
              <SelectItem value="office">In Office</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{filteredMembers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Working from Home</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{wfhCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Working in Office</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{officeCount}</p>
            </CardContent>
          </Card>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.department}</TableCell>
                <TableCell>{member.position}</TableCell>
                <TableCell>{member.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default ManagerTeamScheduleView

