"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Calculator, TrendingUp, Target } from "lucide-react"

export default function GradeCalculator() {
  const [assignments, setAssignments] = useState([
    { name: "Homework 1", points: 85, maxPoints: 100, weight: 1 },
    { name: "Quiz 1", points: 92, maxPoints: 100, weight: 1 },
    { name: "Midterm", points: 78, maxPoints: 100, weight: 2 },
  ])

  const [categories, setCategories] = useState([
    { name: "Homework", weight: 30, grades: [85, 90, 88] },
    { name: "Quizzes", weight: 20, grades: [92, 87, 95] },
    { name: "Exams", weight: 50, grades: [78, 82] },
  ])

  const [finalGradeInputs, setFinalGradeInputs] = useState({
    currentGrade: 85,
    desiredGrade: 90,
    finalWeight: 25,
  })

  const [newAssignment, setNewAssignment] = useState({
    name: "",
    points: "",
    maxPoints: "",
    weight: 1,
  })

  const [newCategory, setNewCategory] = useState({
    name: "",
    weight: "",
    grades: "",
  })

  // Points-based calculation
  const calculatePointsGrade = () => {
    const totalPoints = assignments.reduce((sum, assignment) => sum + assignment.points * assignment.weight, 0)
    const totalMaxPoints = assignments.reduce((sum, assignment) => sum + assignment.maxPoints * assignment.weight, 0)
    return totalMaxPoints > 0 ? (totalPoints / totalMaxPoints) * 100 : 0
  }

  // Category-based calculation
  const calculateCategoryGrade = () => {
    let totalWeightedScore = 0
    let totalWeight = 0

    categories.forEach((category) => {
      if (category.grades.length > 0) {
        const categoryAverage = category.grades.reduce((sum, grade) => sum + grade, 0) / category.grades.length
        totalWeightedScore += categoryAverage * (category.weight / 100)
        totalWeight += category.weight / 100
      }
    })

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0
  }

  // Final grade calculation
  const calculateRequiredFinal = () => {
    const { currentGrade, desiredGrade, finalWeight } = finalGradeInputs
    const currentWeight = (100 - finalWeight) / 100
    const finalWeightDecimal = finalWeight / 100

    const requiredFinal = (desiredGrade - currentGrade * currentWeight) / finalWeightDecimal
    return requiredFinal
  }

  const addAssignment = () => {
    if (newAssignment.name && newAssignment.points && newAssignment.maxPoints) {
      setAssignments([
        ...assignments,
        {
          name: newAssignment.name,
          points: Number.parseFloat(newAssignment.points),
          maxPoints: Number.parseFloat(newAssignment.maxPoints),
          weight: newAssignment.weight,
        },
      ])
      setNewAssignment({ name: "", points: "", maxPoints: "", weight: 1 })
    }
  }

  const removeAssignment = (index) => {
    setAssignments(assignments.filter((_, i) => i !== index))
  }

  const addCategory = () => {
    if (newCategory.name && newCategory.weight && newCategory.grades) {
      const grades = newCategory.grades
        .split(",")
        .map((g) => Number.parseFloat(g.trim()))
        .filter((g) => !isNaN(g))
      setCategories([
        ...categories,
        {
          name: newCategory.name,
          weight: Number.parseFloat(newCategory.weight),
          grades: grades,
        },
      ])
      setNewCategory({ name: "", weight: "", grades: "" })
    }
  }

  const removeCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index))
  }

  const getGradeColor = (grade) => {
    if (grade >= 90) return "text-green-600 bg-green-50 border-green-200"
    if (grade >= 80) return "text-blue-600 bg-blue-50 border-blue-200"
    if (grade >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    if (grade >= 60) return "text-orange-600 bg-orange-50 border-orange-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getLetterGrade = (grade) => {
    if (grade >= 97) return "A+"
    if (grade >= 93) return "A"
    if (grade >= 90) return "A-"
    if (grade >= 87) return "B+"
    if (grade >= 83) return "B"
    if (grade >= 80) return "B-"
    if (grade >= 77) return "C+"
    if (grade >= 73) return "C"
    if (grade >= 70) return "C-"
    if (grade >= 67) return "D+"
    if (grade >= 65) return "D"
    return "F"
  }

  const pointsGrade = calculatePointsGrade()
  const categoryGrade = calculateCategoryGrade()
  const requiredFinal = calculateRequiredFinal()

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Grade Calculator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Calculate your grades with multiple methods and plan for success
        </p>
      </div>

      <Tabs defaultValue="points" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
          <TabsTrigger
            value="points"
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
          >
            <Calculator className="w-4 h-4" />
            Points-Based
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
          >
            <TrendingUp className="w-4 h-4" />
            Category-Based
          </TabsTrigger>
          <TabsTrigger
            value="final"
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
          >
            <Target className="w-4 h-4" />
            Final Grade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 border-2 border-blue-200 dark:border-blue-700">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Add Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Assignment name"
                  value={newAssignment.name}
                  onChange={(e) => setNewAssignment({ ...newAssignment, name: e.target.value })}
                  className="border-2 border-blue-300 focus:border-blue-500 bg-white dark:bg-gray-800"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Points earned"
                    value={newAssignment.points}
                    onChange={(e) => setNewAssignment({ ...newAssignment, points: e.target.value })}
                    className="border-2 border-blue-300 focus:border-blue-500 bg-white dark:bg-gray-800"
                  />
                  <Input
                    type="number"
                    placeholder="Max points"
                    value={newAssignment.maxPoints}
                    onChange={(e) => setNewAssignment({ ...newAssignment, maxPoints: e.target.value })}
                    className="border-2 border-blue-300 focus:border-blue-500 bg-white dark:bg-gray-800"
                  />
                </div>
                <Input
                  type="number"
                  placeholder="Weight (default: 1)"
                  value={newAssignment.weight}
                  onChange={(e) => setNewAssignment({ ...newAssignment, weight: Number.parseInt(e.target.value) || 1 })}
                  className="border-2 border-blue-300 focus:border-blue-500 bg-white dark:bg-gray-800"
                />
                <Button
                  onClick={addAssignment}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Assignment
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900 border-2 border-green-200 dark:border-green-700">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-green-800 dark:text-green-200">Current Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`text-6xl font-bold p-6 rounded-2xl border-2 ${getGradeColor(pointsGrade)}`}>
                    {pointsGrade.toFixed(1)}%
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2 font-bold">
                    Letter Grade: {getLetterGrade(pointsGrade)}
                  </Badge>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Based on {assignments.length} assignments
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-800 dark:to-slate-800 border-2 border-gray-200 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">Assignment List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignments.map((assignment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{assignment.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {assignment.points}/{assignment.maxPoints} points
                        {assignment.weight > 1 && ` (×${assignment.weight})`}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getGradeColor((assignment.points / assignment.maxPoints) * 100)} font-bold`}>
                        {((assignment.points / assignment.maxPoints) * 100).toFixed(1)}%
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeAssignment(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900 dark:to-pink-900 border-2 border-purple-200 dark:border-purple-700">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Add Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="border-2 border-purple-300 focus:border-purple-500 bg-white dark:bg-gray-800"
                />
                <Input
                  type="number"
                  placeholder="Weight (%)"
                  value={newCategory.weight}
                  onChange={(e) => setNewCategory({ ...newCategory, weight: e.target.value })}
                  className="border-2 border-purple-300 focus:border-purple-500 bg-white dark:bg-gray-800"
                />
                <Input
                  placeholder="Grades (comma-separated)"
                  value={newCategory.grades}
                  onChange={(e) => setNewCategory({ ...newCategory, grades: e.target.value })}
                  className="border-2 border-purple-300 focus:border-purple-500 bg-white dark:bg-gray-800"
                />
                <Button
                  onClick={addCategory}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900 border-2 border-green-200 dark:border-green-700">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-green-800 dark:text-green-200">Overall Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`text-6xl font-bold p-6 rounded-2xl border-2 ${getGradeColor(categoryGrade)}`}>
                    {categoryGrade.toFixed(1)}%
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2 font-bold">
                    Letter Grade: {getLetterGrade(categoryGrade)}
                  </Badge>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Based on {categories.length} categories
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-800 dark:to-slate-800 border-2 border-gray-200 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category, index) => {
                  const average =
                    category.grades.length > 0
                      ? category.grades.reduce((sum, grade) => sum + grade, 0) / category.grades.length
                      : 0

                  return (
                    <div
                      key={index}
                      className="p-4 bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-gray-200">{category.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Weight: {category.weight}% | {category.grades.length} grades
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`${getGradeColor(average)} font-bold`}>{average.toFixed(1)}%</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeCategory(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.grades.map((grade, gradeIndex) => (
                          <Badge key={gradeIndex} variant="outline" className="text-xs">
                            {grade}%
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="final" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900 dark:to-red-900 border-2 border-orange-200 dark:border-orange-700">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-orange-800 dark:text-orange-200 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Final Grade Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Current Grade (%)
                  </label>
                  <Input
                    type="number"
                    value={finalGradeInputs.currentGrade}
                    onChange={(e) =>
                      setFinalGradeInputs({ ...finalGradeInputs, currentGrade: Number.parseFloat(e.target.value) || 0 })
                    }
                    className="border-2 border-orange-300 focus:border-orange-500 bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Desired Grade (%)
                  </label>
                  <Input
                    type="number"
                    value={finalGradeInputs.desiredGrade}
                    onChange={(e) =>
                      setFinalGradeInputs({ ...finalGradeInputs, desiredGrade: Number.parseFloat(e.target.value) || 0 })
                    }
                    className="border-2 border-orange-300 focus:border-orange-500 bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Final Exam Weight (%)
                  </label>
                  <Input
                    type="number"
                    value={finalGradeInputs.finalWeight}
                    onChange={(e) =>
                      setFinalGradeInputs({ ...finalGradeInputs, finalWeight: Number.parseFloat(e.target.value) || 0 })
                    }
                    className="border-2 border-orange-300 focus:border-orange-500 bg-white dark:bg-gray-800"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 border-2 border-blue-200 dark:border-blue-700">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-800 dark:text-blue-200">
                  Required Final Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div
                    className={`text-6xl font-bold p-6 rounded-2xl border-2 ${getGradeColor(Math.max(0, requiredFinal))}`}
                  >
                    {requiredFinal.toFixed(1)}%
                  </div>
                  <div className="space-y-2">
                    {requiredFinal > 100 && (
                      <Badge variant="destructive" className="text-sm px-3 py-1">
                        ⚠️ Score higher than 100% required
                      </Badge>
                    )}
                    {requiredFinal < 0 && (
                      <Badge variant="default" className="text-sm px-3 py-1 bg-green-500">
                        🎉 You can score 0% and still reach your goal!
                      </Badge>
                    )}
                    {requiredFinal >= 0 && requiredFinal <= 100 && (
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        ✅ Achievable with effort!
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-800 dark:to-slate-800 border-2 border-gray-200 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">Grade Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[60, 70, 80, 90, 95, 100].map((finalScore) => {
                  const overallGrade =
                    (finalGradeInputs.currentGrade * (100 - finalGradeInputs.finalWeight)) / 100 +
                    (finalScore * finalGradeInputs.finalWeight) / 100

                  return (
                    <div
                      key={finalScore}
                      className={`p-4 rounded-lg border-2 text-center ${getGradeColor(overallGrade)}`}
                    >
                      <div className="font-bold text-lg">Final: {finalScore}%</div>
                      <div className="text-2xl font-bold">{overallGrade.toFixed(1)}%</div>
                      <div className="text-sm font-semibold">{getLetterGrade(overallGrade)}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
