"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  Chip
} from "@mui/material";
import { Plus } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  products?: any[];
  _count?: {
    products: number;
  };
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await api.get<Supplier[]>("/suppliers");
      setSuppliers(data);
    } catch (err: any) {
      console.error("Error fetching suppliers:", err);
      setError("No se pudo cargar la lista de proveedores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al proveedor "${name}"?`)) {
      try {
        await api.delete(`/suppliers/${id}`);
        setSuppliers(suppliers.filter((s) => s.id !== id));
      } catch (err: any) {
        console.error("Error deleting supplier:", err);
        setError(err.message || "No se pudo eliminar el proveedor.");
      }
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    return (
      supplier.name.toLowerCase().includes(search.toLowerCase()) ||
      (supplier.contact && supplier.contact.toLowerCase().includes(search.toLowerCase())) ||
      (supplier.email && supplier.email.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Title & Action Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 750, color: "text.primary" }}>
            Directorio de Proveedores
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra la información de contacto y canales de distribución de tus proveedores
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/suppliers/new"
          variant="contained"
          color="primary"
          startIcon={<Plus className="w-4 h-4" />}
        >
          Registrar Proveedor
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 1.5 }}>
          {error}
        </Alert>
      )}

      {/* Search Input Box */}
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por Nombre, Contacto o Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
          />
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 2 }}>
          <CircularProgress color="primary" />
          <Typography variant="body2" color="text.secondary">Cargando directorio...</Typography>
        </Box>
      ) : filteredSuppliers.length === 0 ? (
        <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 8 }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Typography variant="h3">🚚</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Directorio Vacío</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mb: 1 }}>
              No se encontraron proveedores registrados en este momento.
            </Typography>
            <Button component={Link} href="/suppliers/new" variant="outlined" color="primary">
              Registrar Primer Proveedor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none", borderRadius: 1.5 }}>
          <Table>
            <TableHead sx={{ bgcolor: "background.default" }}>
              <TableRow>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Nombre / Razón Social</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Contacto Ejecutivo</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Datos de Contacto</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Productos en Catálogo</Typography></TableCell>
                <TableCell align="right"><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Acciones</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers.map((supplier) => {
                const productCount = supplier._count?.products ?? supplier.products?.length ?? 0;
                return (
                  <TableRow key={supplier.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ 
                          width: 36, 
                          height: 36, 
                          bgcolor: 'primary.light', 
                          color: 'primary.main', 
                          fontSize: '14px', 
                          fontWeight: 700,
                          borderRadius: 1.5
                        }}>
                          {supplier.name[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                            {supplier.name}
                          </Typography>
                          {supplier.address && (
                            <Typography variant="caption" color="text.secondary">📍 {supplier.address}</Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{supplier.contact || "Sin asignar"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        {supplier.email && <Typography variant="body2">📧 {supplier.email}</Typography>}
                        {supplier.phone && <Typography variant="caption" color="text.secondary">📞 {supplier.phone}</Typography>}
                        {!supplier.email && !supplier.phone && <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>Sin datos</Typography>}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${productCount} ${productCount === 1 ? 'Producto' : 'Productos'}`} 
                        color={productCount > 0 ? "success" : "default"}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        <Button 
                          component={Link} 
                          href={`/suppliers/${supplier.id}`} 
                          variant="outlined" 
                          color="secondary" 
                          size="small"
                          sx={{ fontWeight: 600, textTransform: "none" }}
                        >
                          Editar
                        </Button>
                        <Button 
                          onClick={() => handleDelete(supplier.id, supplier.name)}
                          variant="outlined" 
                          color="error" 
                          size="small"
                          sx={{ fontWeight: 600, textTransform: "none" }}
                        >
                          Eliminar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
