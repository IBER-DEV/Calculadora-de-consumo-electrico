"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Moon, Sun, Leaf } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Electrodomestico {
  id: number
  nombre: string
  potencia: number
  horasDiarias: number
}

interface PaisInfo {
  nombre: string
  moneda: string
  simbolo: string
  tarifaPromedio: number
}

const paisesInfo: { [key: string]: PaisInfo } = {
  "ES": { nombre: "España", moneda: "EUR", simbolo: "€", tarifaPromedio: 0.15 },
  "US": { nombre: "Estados Unidos", moneda: "USD", simbolo: "$", tarifaPromedio: 0.14 },
  "MX": { nombre: "México", moneda: "MXN", simbolo: "$", tarifaPromedio: 1.5 },
  "AR": { nombre: "Argentina", moneda: "ARS", simbolo: "$", tarifaPromedio: 5.0 },
  "CO": { nombre: "Colombia", moneda: "COP", simbolo: "$", tarifaPromedio: 500 },
  "CL": { nombre: "Chile", moneda: "CLP", simbolo: "$", tarifaPromedio: 100 },
  "PE": { nombre: "Perú", moneda: "PEN", simbolo: "S/", tarifaPromedio: 0.6 },
}

export default function CalculadoraConsumo() {
  const [electrodomesticos, setElectrodomesticos] = useState<Electrodomestico[]>([])
  const [nombre, setNombre] = useState("")
  const [potencia, setPotencia] = useState("")
  const [horasDiarias, setHorasDiarias] = useState("")
  const [tarifaKwh, setTarifaKwh] = useState("0.15")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [periodoGrafico, setPeriodoGrafico] = useState("diario")
  const [paisSeleccionado, setPaisSeleccionado] = useState("ES")

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    setTarifaKwh(paisesInfo[paisSeleccionado].tarifaPromedio.toString())
  }, [paisSeleccionado])

  const agregarOEditarElectrodomestico = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId !== null) {
      setElectrodomesticos(
        electrodomesticos.map((e) =>
          e.id === editingId
            ? { ...e, nombre, potencia: parseFloat(potencia), horasDiarias: parseFloat(horasDiarias) }
            : e
        )
      )
      setEditingId(null)
    } else {
      const nuevoElectrodomestico: Electrodomestico = {
        id: Date.now(),
        nombre,
        potencia: parseFloat(potencia),
        horasDiarias: parseFloat(horasDiarias),
      }
      setElectrodomesticos([...electrodomesticos, nuevoElectrodomestico])
    }
    setNombre("")
    setPotencia("")
    setHorasDiarias("")
  }

  const editarElectrodomestico = (id: number) => {
    const electrodomestico = electrodomesticos.find((e) => e.id === id)
    if (electrodomestico) {
      setNombre(electrodomestico.nombre)
      setPotencia(electrodomestico.potencia.toString())
      setHorasDiarias(electrodomestico.horasDiarias.toString())
      setEditingId(id)
    }
  }

  const eliminarElectrodomestico = (id: number) => {
    setElectrodomesticos(electrodomesticos.filter((e) => e.id !== id))
  }

  const calcularConsumoTotal = () => {
    return electrodomesticos.reduce((total, e) => {
      return total + (e.potencia * e.horasDiarias * 30) / 1000
    }, 0)
  }

  const calcularCostoTotal = () => {
    const consumoTotal = calcularConsumoTotal()
    return consumoTotal * parseFloat(tarifaKwh)
  }

  const calcularCostoPorElectrodomestico = (e: Electrodomestico) => {
    const consumo = (e.potencia * e.horasDiarias * 30) / 1000
    return consumo * parseFloat(tarifaKwh)
  }

  const generarDatosGrafico = () => {
    let datos = []
    const periodos = periodoGrafico === "diario" ? 24 : periodoGrafico === "semanal" ? 7 : 30
    const factor = periodoGrafico === "diario" ? 1 : periodoGrafico === "semanal" ? 7 : 30

    for (let i = 0; i < periodos; i++) {
      let consumoTotal = 0
      let costoTotal = 0

      electrodomesticos.forEach(e => {
        const horasUso = periodoGrafico === "diario" ? (i < e.horasDiarias ? 1 : 0) : e.horasDiarias
        const consumo = (e.potencia * horasUso * factor) / 1000
        consumoTotal += consumo
        costoTotal += consumo * parseFloat(tarifaKwh)
      })

      datos.push({
        periodo: periodoGrafico === "diario" ? `${i}h` : periodoGrafico === "semanal" ? `Día ${i + 1}` : `Día ${i + 1}`,
        consumo: consumoTotal.toFixed(2),
        costo: costoTotal.toFixed(2)
      })
    }

    return datos
  }

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: paisesInfo[paisSeleccionado].moneda,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor)
  }

  return (
    <div className={`min-h-screen bg-gray-100 ${darkMode ? 'dark' : ''}`}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
            <Leaf className="mr-2 text-green-500" />
            Calculadora de Consumo Eléctrico
          </h1>
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4 text-yellow-500" />
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
              className="bg-gray-200 dark:bg-gray-700"
              aria-label="Toggle dark mode"
            />
            <Moon className="h-4 w-4 text-blue-500" />
          </div>
        </div>

        <Card className="mb-8 bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-white">Configuración Regional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pais" className="text-gray-700 dark:text-gray-300">País</Label>
                <Select value={paisSeleccionado} onValueChange={setPaisSeleccionado}>
                  <SelectTrigger id="pais" className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Seleccione un país" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(paisesInfo).map(([codigo, info]) => (
                      <SelectItem key={codigo} value={codigo}>{info.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tarifaKwh" className="text-gray-700 dark:text-gray-300">Tarifa eléctrica (por kWh)</Label>
                <Input
                  id="tarifaKwh"
                  type="number"
                  value={tarifaKwh}
                  onChange={(e) => setTarifaKwh(e.target.value)}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="formulario" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 rounded-lg shadow">
            <TabsTrigger value="formulario" className="text-gray-800 dark:text-white data-[state=active]:bg-blue-500 data-[state=active]:text-white">Agregar Electrodoméstico</TabsTrigger>
            <TabsTrigger value="lista" className="text-gray-800 dark:text-white data-[state=active]:bg-blue-500 data-[state=active]:text-white">Lista de Electrodomésticos</TabsTrigger>
            <TabsTrigger value="graficos" className="text-gray-800 dark:text-white data-[state=active]:bg-blue-500 data-[state=active]:text-white">Gráficos</TabsTrigger>
          </TabsList>
          <TabsContent value="formulario">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-white">{editingId !== null ? "Editar" : "Agregar"} Electrodoméstico</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Ingrese los datos del electrodoméstico para calcular su consumo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={agregarOEditarElectrodomestico} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="nombre" className="text-gray-700 dark:text-gray-300">Nombre del electrodoméstico</Label>
                      <Input
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="potencia" className="text-gray-700 dark:text-gray-300">Potencia (Watts)</Label>
                      <Input
                        id="potencia"
                        type="number"
                        value={potencia}
                        onChange={(e) => setPotencia(e.target.value)}
                        required
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="horasDiarias" className="text-gray-700 dark:text-gray-300">Horas de uso diarias</Label>
                      <Input
                        id="horasDiarias"
                        type="number"
                        value={horasDiarias}
                        onChange={(e) => setHorasDiarias(e.target.value)}
                        required
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white">
                    {editingId !== null ? "Guardar Cambios" : "Agregar Electrodoméstico"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="lista">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-white">Lista de Electrodomésticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-700 dark:text-gray-300">Nombre</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Potencia (W)</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Horas diarias</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Consumo mensual (kWh)</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Costo mensual</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {electrodomesticos.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="text-gray-800 dark:text-white">{e.nombre}</TableCell>
                          <TableCell className="text-gray-800 dark:text-white">{e.potencia}</TableCell>
                          <TableCell className="text-gray-800 dark:text-white">{e.horasDiarias}</TableCell>
                          <TableCell className="text-gray-800 dark:text-white">{((e.potencia * e.horasDiarias * 30) / 1000).toFixed(2)}</TableCell>
                          <TableCell className="text-gray-800 dark:text-white">{formatearMoneda(calcularCostoPorElectrodomestico(e))}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => editarElectrodomestico(e.id)} className="text-blue-500 border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900">
                                Editar
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => eliminarElectrodomestico(e.id)} className="bg-red-500 text-white hover:bg-red-600">
                                Eliminar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="graficos">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-white">Gráficos de Consumo y Costo</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Visualice el consumo energético y los costos en diferentes periodos de tiempo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label htmlFor="periodoGrafico" className="text-gray-700 dark:text-gray-300">Seleccione el periodo</Label>
                  <Select value={periodoGrafico} onValueChange={setPeriodoGrafico}>
                    <SelectTrigger id="periodoGrafico" className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Seleccione un periodo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diario">Diario</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensual">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={generarDatosGrafico()}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" stroke="#718096" />
                      <YAxis yAxisId="left" stroke="#718096" />
                      <YAxis yAxisId="right" orientation="right" stroke="#718096" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === "Costo") {
                            return [formatearMoneda(parseFloat(value as string)), name];
                          }
                          return [value, name];
                        }}
                        contentStyle={{ backgroundColor: '#f7fafc', border: '1px solid #e2e8f0' }}
                      />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="consumo" stroke="#48bb78" activeDot={{ r: 8 }} name="Consumo (kWh)" />
                      <Line yAxisId="right" type="monotone" dataKey="costo" stroke="#4299e1" name="Costo" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-white">Resumen de Consumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-green-100 dark:bg-green-900">
                <CardHeader>
                  <CardTitle className="text-gray-800 dark:text-white">Consumo Total Mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{calcularConsumoTotal().toFixed(2)} kWh</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-100 dark:bg-blue-900">
                <CardHeader>
                  <CardTitle className="text-gray-800 dark:text-white">Costo Estimado Mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatearMoneda(calcularCostoTotal())}</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">Ver Desglose de Costos</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-gray-800 dark:text-white">Desglose de Costos por Electrodoméstico</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-700 dark:text-gray-300">Electrodoméstico</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Costo Mensual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {electrodomesticos.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-gray-800 dark:text-white">{e.nombre}</TableCell>
                      <TableCell className="text-gray-800 dark:text-white">{formatearMoneda(calcularCostoPorElectrodomestico(e))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}