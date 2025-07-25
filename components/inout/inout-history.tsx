"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, Package, TruckIcon, BarChart3, X } from "lucide-react"
import { InOutRecord, mockInOutData } from "@/components/utils"
import { Separator } from "@/components/ui/separator"

type DisplayUnit = "개수" | "set"

interface RegistrationItem {
  id: number;
  productName: string;
  specification: string;
  quantity: string;
  location: string;
  company: string;
  destination: string;
  notes: string;
  type?: "inbound" | "outbound";
}

export default function InOutHistory() {
  const [filters, setFilters] = useState({
    type: "all",
    productName: "",
    specification: "",
    location: "",
    company: "",
    status: "all",
    destination: "",
    date: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [registrationItems, setRegistrationItems] = useState<RegistrationItem[]>([])
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit>('set')

  const itemsPerPage = 10
  const SET_QUANTITY = 14

  const historyData: InOutRecord[] = mockInOutData

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
    setCurrentPage(1)
  }

  const handleToggleFilter = (field: 'type' | 'status', value: string) => {
    setFilters(prev => ({
        ...prev,
        [field]: prev[field] === value ? 'all' : value
    }));
    setCurrentPage(1);
  };

  const filteredHistory = historyData.filter((item) => {
    return (
      (filters.type === "all" || item.type === filters.type) &&
      item.productName.toLowerCase().includes(filters.productName.toLowerCase()) &&
      item.specification.toLowerCase().includes(filters.specification.toLowerCase()) &&
      item.location.toLowerCase().includes(filters.location.toLowerCase()) &&
      item.company.toLowerCase().includes(filters.company.toLowerCase()) &&
      (filters.status === "all" || item.status === filters.status) &&
      item.destination.toLowerCase().includes(filters.destination.toLowerCase()) &&
      (filters.date === "" || item.date === filters.date)
    )
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredHistory.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const addRegistrationItem = () => {
    const newItem = {
      id: registrationItems.length + 1,
      productName: "",
      specification: "",
      quantity: "",
      location: "창고1",
      company: "",
      destination: "",
      notes: "",
    }
    setRegistrationItems([...registrationItems, newItem])
  }

  const removeRegistrationItem = (id: number) => {
    if (registrationItems.length > 1) {
      setRegistrationItems(registrationItems.filter((item) => item.id !== id))
    }
  }

  const updateRegistrationItem = (id: number, field: string, value: string) => {
    setRegistrationItems(registrationItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleRegistrationSubmit = () => {
    console.log("등록할 항목들:", registrationItems)
    setIsRegistrationModalOpen(false)
    setRegistrationItems([])
  }

  const getStatusChipClass = (status: "완료" | "진행 중" | "예약") => {
    switch (status) {
      case "완료":
        return "bg-green-100 text-green-800"
      case "진행 중":
        return "bg-blue-100 text-blue-800"
      case "예약":
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">입출고 내역</h2>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsRegistrationModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              입출고 등록
            </Button>
          </div>
        </div>
        <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">오늘 입고</p>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-xs text-green-600">0% 전일대비</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">오늘 출고</p>
                  <p className="text-2xl font-bold text-red-600">0</p>
                  <p className="text-xs text-red-600">0% 전일대비</p>
                </div>
                <TruckIcon className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">이번 주 총량</p>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-green-600">0% 전주대비</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={filters.type === "all" && filters.status === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setFilters(prev => ({...prev, type: 'all', status: 'all'}));
                    setCurrentPage(1);
                  }}
                >
                  전체
                </Button>
                <Separator orientation="vertical" className="mx-1 h-6" />
                <Button
                  variant={filters.type === "inbound" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleFilter("type", "inbound")}
                >
                  입고
                </Button>
                <Button
                  variant={filters.type === "outbound" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleFilter("type", "outbound")}
                >
                  출고
                </Button>
                <Separator orientation="vertical" className="mx-1 h-6" />
                <Button
                  variant={filters.status === "진행 중" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleFilter("status", "진행 중")}
                >
                  진행 중
                </Button>
                <Button
                  variant={filters.status === "예약" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleFilter("status", "예약")}
                >
                  예약
                </Button>
                <Button
                  variant={filters.status === "완료" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleFilter("status", "완료")}
                >
                  완료
                </Button>
            </div>
            <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                검색
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                {/* Filter Inputs */}
                <Input placeholder="상품명" value={filters.productName} onChange={(e) => handleFilterChange("productName", e.target.value)} />
                <Input placeholder="규격" value={filters.specification} onChange={(e) => handleFilterChange("specification", e.target.value)} />
                <Input placeholder="구역" value={filters.location} onChange={(e) => handleFilterChange("location", e.target.value)} />
                <Input placeholder="거래처" value={filters.company} onChange={(e) => handleFilterChange("company", e.target.value)} />
                <Input placeholder="목적지" value={filters.destination} onChange={(e) => handleFilterChange("destination", e.target.value)} />
                <Input type="date" value={filters.date} onChange={(e) => handleFilterChange("date", e.target.value)} />
                
                 <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({
                        type: "all",
                        productName: "",
                        specification: "",
                        location: "",
                        company: "",
                        status: "all",
                        destination: "",
                        date: "",
                      })
                      setCurrentPage(1)
                    }}
                    className="text-gray-600"
                  >
                    필터 초기화
                  </Button>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                {Object.values(filters).some((filter) => filter !== "" && filter !== "all") && (
                  <span className="inline-flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    필터 적용됨 -
                  </span>
                )}{" "}
                총 {filteredHistory.length}개 항목
              </div>
            </div>

            <div>
              <table className="w-full text-sm min-w-[1200px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 md:p-3 font-semibold">유형</th>
                    <th className="text-left p-2 md:p-3 font-semibold">상품명</th>
                    <th className="text-left p-2 md:p-3 font-semibold">개별코드</th>
                    <th className="text-left p-2 md:p-3 font-semibold">규격</th>
                    <th className="text-center p-2 md:p-3 font-semibold">수량</th>
                    <th className="relative text-center p-2 md:p-3 pt-7 font-semibold">
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-full">
                        {displayUnit === 'set' && (
                          <p className="relative bottom-3 text-xs text-gray-500 font-normal whitespace-nowrap ">
                            (1 set = {SET_QUANTITY}개)
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span>주문수량</span>
                        <Select value={displayUnit} onValueChange={(value: DisplayUnit) => setDisplayUnit(value)}>
                          <SelectTrigger className="w-24 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="set">Set</SelectItem>
                            <SelectItem value="개수">개수</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </th>
                    <th className="text-center p-2 md:p-3 font-semibold">구역</th>
                    <th className="text-left p-2 md:p-3 font-semibold">거래처</th>
                    <th className="text-center p-2 md:p-3 font-semibold">상태</th>
                    <th className="text-left p-2 md:p-3 font-semibold">목적지</th>
                    <th className="text-center p-2 md:p-3 font-semibold">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 md:p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            item.type === "inbound" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.type === "inbound" ? "입고" : "출고"}
                        </span>
                      </td>
                      <td className="p-2 md:p-3">
                        <p className="font-medium text-sm break-words">{item.productName}</p>
                        <p className="text-xs text-gray-500 break-all">SKU: {item.sku}</p>
                      </td>
                      <td className="p-2 md:p-3 text-sm">{item.individualCode}</td>
                      <td className="p-2 md:p-3 text-sm">{item.specification}</td>
                      <td className="p-2 md:p-3 text-center">
                        <span className="font-semibold">{item.quantity}</span>
                      </td>
                      <td className="p-2 md:p-3 text-center">
                        <div className="font-semibold">
                          {displayUnit === 'set'
                            ? `${Math.floor(item.quantity / SET_QUANTITY)} set`
                            : `${item.quantity} 개`}
                        </div>
                      </td>
                      <td className="p-2 md:p-3 text-center text-sm">{item.location}</td>
                      <td className="p-2 md:p-3 text-sm">{item.company}</td>
                      <td className="p-2 md:p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusChipClass(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-2 md:p-3 text-sm">{item.destination || "-"}</td>
                      <td className="p-2 md:p-3 text-center">
                        <div>
                          <p className="text-sm whitespace-nowrap">{item.date}</p>
                          <p className="text-xs text-gray-500">{item.time}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>검색 결과가 없습니다.</p>
                <p className="text-sm mt-1">다른 검색어를 시도해보세요.</p>
              </div>
            )}

            {filteredHistory.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600 flex-shrink-0">
                  총 {filteredHistory.length}개 중 {startIndex + 1}-
                  {Math.min(startIndex + itemsPerPage, filteredHistory.length)}개 표시
                </div>
                <div className="flex gap-1 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-3"
                  >
                    이전
                  </Button>
                  {(() => {
                    const pageNumbers = []
                    const pageGroupSize = 5
                    const currentGroup = Math.ceil(currentPage / pageGroupSize)
                    const startPage = (currentGroup - 1) * pageGroupSize + 1
                    const endPage = Math.min(startPage + pageGroupSize - 1, totalPages)

                    for (let i = startPage; i <= endPage; i++) {
                      pageNumbers.push(
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className={`px-3 ${currentPage === i ? "bg-blue-50 text-blue-600" : ""}`}
                          onClick={() => handlePageChange(i)}
                        >
                          {i}
                        </Button>
                      )
                    }
                    return pageNumbers
                  })()}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-3"
                  >
                    다음
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isRegistrationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>입출고 등록</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsRegistrationModalOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                {registrationItems.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">항목 {index + 1}</h4>
                      {registrationItems.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRegistrationItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`type-${item.id}`}>유형 *</Label>
                        <select
                          id={`type-${item.id}`}
                          value={item.type}
                          onChange={(e) => updateRegistrationItem(item.id, "type", e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="inbound">입고</option>
                          <option value="outbound">출고</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor={`productName-${item.id}`}>상품명 *</Label>
                        <Input
                          id={`productName-${item.id}`}
                          value={item.productName}
                          onChange={(e) => updateRegistrationItem(item.id, "productName", e.target.value)}
                          placeholder="상품명을 입력하세요"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor={`specification-${item.id}`}>규격</Label>
                        <Input
                          id={`specification-${item.id}`}
                          value={item.specification}
                          onChange={(e) => updateRegistrationItem(item.id, "specification", e.target.value)}
                          placeholder="규격을 입력하세요"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`quantity-${item.id}`}>수량 *</Label>
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateRegistrationItem(item.id, "quantity", e.target.value)}
                          placeholder="수량을 입력하세요"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor={`location-${item.id}`}>위치 *</Label>
                        <select
                          id={`location-${item.id}`}
                          value={item.location}
                          onChange={(e) => updateRegistrationItem(item.id, "location", e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="창고1">창고1</option>
                          <option value="창고2">창고2</option>
                          <option value="창고3">창고3</option>
                          <option value="창고4">창고4</option>
                          <option value="창고5">창고5</option>
                          <option value="창고6">창고6</option>
                          <option value="창고7">창고7</option>
                          <option value="창고8">창고8</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor={`company-${item.id}`}>거래처</Label>
                        <Input
                          id={`company-${item.id}`}
                          value={item.company}
                          onChange={(e) => updateRegistrationItem(item.id, "company", e.target.value)}
                          placeholder="거래처를 입력하세요"
                        />
                      </div>

                      {item.type === "outbound" && (
                        <div>
                          <Label htmlFor={`destination-${item.id}`}>목적지</Label>
                          <Input
                            id={`destination-${item.id}`}
                            value={item.destination}
                            onChange={(e) => updateRegistrationItem(item.id, "destination", e.target.value)}
                            placeholder="목적지를 입력하세요"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <Label htmlFor={`notes-${item.id}`}>비고</Label>
                      <Textarea
                        id={`notes-${item.id}`}
                        value={item.notes}
                        onChange={(e) => updateRegistrationItem(item.id, "notes", e.target.value)}
                        placeholder="추가 정보를 입력하세요"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={addRegistrationItem}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Plus className="w-4 h-4" />
                    항목 추가
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-6 border-t mt-6">
                <Button onClick={handleRegistrationSubmit} className="flex-1">
                  등록 완료
                </Button>
                <Button variant="outline" onClick={() => setIsRegistrationModalOpen(false)} className="flex-1">
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
