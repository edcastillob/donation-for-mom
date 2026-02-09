import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePersons, useCreatePerson } from '@/hooks/usePersons';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { supabase } from '@/integrations/supabase/client';
import { EXPENSE_CATEGORIES, type TransactionType, type ExpenseCategory } from '@/lib/types';
import { toast } from 'sonner';
import { Loader2, Plus, Upload, Check, X } from 'lucide-react';

interface TransactionFormProps {
  type: TransactionType;
}

export function TransactionForm({ type }: TransactionFormProps) {
  const { data: persons } = usePersons();
  const { data: exchangeRate } = useExchangeRate();
  const createPerson = useCreatePerson();
  const createTransaction = useCreateTransaction();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [amountBs, setAmountBs] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | ''>('');
  const [personId, setPersonId] = useState<string>('');
  const [newPersonName, setNewPersonName] = useState('');
  const [showNewPerson, setShowNewPerson] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim() || !amountBs) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      let finalPersonId = personId || null;

      // Create new person if needed
      if (showNewPerson && newPersonName.trim()) {
        const newPerson = await createPerson.mutateAsync({
          full_name: newPersonName.trim(),
        });
        finalPersonId = newPerson.id;
      }

      // Upload receipt if provided
      let receiptUrl: string | null = null;
      if (receiptFile) {
        const fileName = `${Date.now()}_${receiptFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, receiptFile);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('receipts')
          .getPublicUrl(uploadData.path);

        receiptUrl = publicUrl.publicUrl;
      }

      // Create transaction
      await createTransaction.mutateAsync({
        date,
        type,
        description: description.trim(),
        amount_bs: parseFloat(amountBs),
        category: type === 'expense' && category ? category : null,
        person_id: finalPersonId,
        receipt_image_url: receiptUrl,
        exchange_rate_used: exchangeRate?.promedio || null,
      });

      toast.success(`${type === 'income' ? 'Ingreso' : 'Egreso'} registrado exitosamente`);

      // Reset form
      setDescription('');
      setAmountBs('');
      setCategory('');
      setPersonId('');
      setNewPersonName('');
      setShowNewPerson(false);
      setReceiptFile(null);
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast.error('Error al registrar la transacción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium">Fecha *</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium">Monto (Bs) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amountBs}
            onChange={(e) => setAmountBs(e.target.value)}
            placeholder="0.00"
            required
            className="h-11 text-lg font-medium"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">Descripción *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={type === 'income' ? 'Ej: Donación de Juan Pérez' : 'Ej: Compra de medicamentos'}
          required
          className="min-h-20 resize-none"
        />
      </div>

      {type === 'expense' && (
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">Categoría *</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{type === 'income' ? 'Donante' : 'Persona asociada'}</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowNewPerson(!showNewPerson)}
            className="h-8 text-xs"
          >
            {showNewPerson ? <X className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
            {showNewPerson ? 'Seleccionar existente' : 'Nueva persona'}
          </Button>
        </div>

        {showNewPerson ? (
          <Input
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            placeholder="Nombre completo de la persona"
            className="h-11"
          />
        ) : (
          <Select value={personId} onValueChange={setPersonId}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Selecciona una persona (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {persons?.map((person) => (
                <SelectItem key={person.id} value={person.id}>
                  {person.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="receipt" className="text-sm font-medium">Recibo / Factura (opcional)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="receipt"
            type="file"
            accept="image/*"
            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('receipt')?.click()}
            className="h-11"
          >
            <Upload className="h-4 w-4 mr-2" />
            {receiptFile ? receiptFile.name : 'Subir imagen'}
          </Button>
          {receiptFile && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setReceiptFile(null)}
            >
              Eliminar
            </Button>
          )}
        </div>
      </div>

      <Button 
        type="submit" 
        className={`w-full h-12 text-base font-medium ${
          type === 'income' ? 'bg-income hover:bg-income/90' : 'bg-expense hover:bg-expense/90'
        }`} 
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Check className="mr-2 h-4 w-4" />
        )}
        Registrar {type === 'income' ? 'Ingreso' : 'Egreso'}
      </Button>
    </form>
  );
}
