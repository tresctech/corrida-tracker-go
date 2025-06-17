import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus, Trash2, FileText, Link as LinkIcon } from 'lucide-react';
import { Race, RaceFormData } from '@/types/race';
import { format } from 'date-fns';

const kitPickupDateSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  startTime: z.string().min(1, 'Horário de início é obrigatório'),
  endTime: z.string().min(1, 'Horário de fim é obrigatório'),
});

const raceFormSchema = z.object({
  name: z.string().min(1, 'Nome da corrida é obrigatório'),
  status: z.enum(['upcoming', 'completed', 'interest']),
  raceDate: z.string().min(1, 'Data da corrida é obrigatória'),
  startTime: z.string().min(1, 'Horário de início é obrigatório'),
  distance: z.number().min(0.1, 'Distância deve ser maior que 0'),
  kitPickupAddress: z.string().min(1, 'Endereço de retirada do kit é obrigatório'),
  kitPickupDates: z.union([
    z.literal('to-be-defined'),
    z.array(kitPickupDateSchema).min(1, 'Pelo menos uma data de retirada é necessária')
  ]),
  registrationProofUrl: z.string().optional(),
  registrationProofType: z.enum(['file', 'link']).optional(),
  observations: z.string().optional(),
});

interface RaceFormProps {
  race?: Race;
  onSubmit: (data: RaceFormData) => void;
  onCancel: () => void;
}

export const RaceForm = ({ race, onSubmit, onCancel }: RaceFormProps) => {
  const form = useForm<RaceFormData>({
    resolver: zodResolver(raceFormSchema),
    defaultValues: {
      name: '',
      status: 'upcoming',
      raceDate: '',
      startTime: '',
      distance: 0,
      kitPickupAddress: '',
      kitPickupDates: [],
      registrationProofUrl: '',
      registrationProofType: 'link',
      observations: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'kitPickupDates' as const,
  });

  useEffect(() => {
    if (race) {
      form.reset({
        name: race.name,
        status: race.status,
        raceDate: format(race.raceDate, 'yyyy-MM-dd'),
        startTime: race.startTime,
        distance: race.distance,
        kitPickupAddress: race.kitPickupAddress,
        kitPickupDates: race.kitPickupDates === 'to-be-defined' ? 'to-be-defined' : race.kitPickupDates,
        registrationProofUrl: race.registrationProof?.url,
        registrationProofType: race.registrationProof?.type,
        observations: race.observations,
      });
    }
  }, [race, form]);

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit({
      ...data,
      distance: parseFloat(data.distance.toString()),
    });
  });

  const handleKitPickupTypeChange = (type: string) => {
    if (type === 'to-be-defined') {
      form.setValue('kitPickupDates', 'to-be-defined');
    } else {
      const currentValue = form.getValues('kitPickupDates');
      if (currentValue === 'to-be-defined' || !Array.isArray(currentValue)) {
        form.setValue('kitPickupDates', []);
      }
    }
  };

  const addKitPickupDate = () => {
    const currentValue = form.getValues('kitPickupDates');
    if (currentValue === 'to-be-defined') {
      form.setValue('kitPickupDates', []);
    }
    append({ date: '', startTime: '', endTime: '' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{race ? 'Editar Corrida' : 'Adicionar Corrida'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Corrida</Label>
            <Input id="name" type="text" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => form.setValue('status', value as 'upcoming' | 'completed' | 'interest')}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">A Fazer</SelectItem>
                <SelectItem value="completed">Realizada</SelectItem>
                <SelectItem value="interest">Interesse</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.status && (
              <p className="text-red-500 text-sm">{form.formState.errors.status.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="raceDate">Data da Corrida</Label>
            <Input id="raceDate" type="date" {...form.register('raceDate')} />
            {form.formState.errors.raceDate && (
              <p className="text-red-500 text-sm">{form.formState.errors.raceDate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="startTime">Horário de Início</Label>
            <Input id="startTime" type="time" {...form.register('startTime')} />
            {form.formState.errors.startTime && (
              <p className="text-red-500 text-sm">{form.formState.errors.startTime.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="distance">Distância (km)</Label>
            <Input id="distance" type="number" step="0.1" {...form.register('distance')} />
            {form.formState.errors.distance && (
              <p className="text-red-500 text-sm">{form.formState.errors.distance.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="kitPickupAddress">Endereço de Retirada do Kit</Label>
            <Input id="kitPickupAddress" type="text" {...form.register('kitPickupAddress')} />
            {form.formState.errors.kitPickupAddress && (
              <p className="text-red-500 text-sm">{form.formState.errors.kitPickupAddress.message}</p>
            )}
          </div>

          <div>
            <Label>Datas de Retirada do Kit</Label>
            <Select onValueChange={(value) => handleKitPickupTypeChange(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="defined">Definido</SelectItem>
                <SelectItem value="to-be-defined">A definir</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.kitPickupDates && (
              <p className="text-red-500 text-sm">{form.formState.errors.kitPickupDates.message}</p>
            )}

            {form.getValues('kitPickupDates') !== 'to-be-defined' && (
              <div className="mt-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2 mb-2">
                    <div>
                      <Label htmlFor={`kitPickupDates.${index}.date`}>Data</Label>
                      <Input
                        id={`kitPickupDates.${index}.date`}
                        type="date"
                        {...form.register(`kitPickupDates.${index}.date`)}
                      />
                      {form.formState.errors.kitPickupDates?.[index]?.date && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.kitPickupDates[index]?.date?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`kitPickupDates.${index}.startTime`}>Início</Label>
                      <Input
                        id={`kitPickupDates.${index}.startTime`}
                        type="time"
                        {...form.register(`kitPickupDates.${index}.startTime`)}
                      />
                      {form.formState.errors.kitPickupDates?.[index]?.startTime && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.kitPickupDates[index]?.startTime?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`kitPickupDates.${index}.endTime`}>Fim</Label>
                      <Input
                        id={`kitPickupDates.${index}.endTime`}
                        type="time"
                        {...form.register(`kitPickupDates.${index}.endTime`)}
                      />
                      {form.formState.errors.kitPickupDates?.[index]?.endTime && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.kitPickupDates[index]?.endTime?.message}
                        </p>
                      )}
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={addKitPickupDate} className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Data
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label>Comprovante de Inscrição</Label>
            <div className="flex items-center space-x-4 mt-2">
              <Button
                variant="outline"
                onClick={() => form.setValue('registrationProofType', 'file')}
                className={form.watch('registrationProofType') === 'file' ? 'bg-accent text-accent-foreground' : ''}
              >
                <FileText className="w-4 h-4 mr-2" />
                Arquivo
              </Button>
              <Button
                variant="outline"
                onClick={() => form.setValue('registrationProofType', 'link')}
                className={form.watch('registrationProofType') === 'link' ? 'bg-accent text-accent-foreground' : ''}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Link
              </Button>
            </div>

            {form.watch('registrationProofType') === 'file' && (
              <div className="mt-2">
                <Label htmlFor="registrationProofFile">Arquivo</Label>
                <Input id="registrationProofFile" type="file" />
              </div>
            )}

            {form.watch('registrationProofType') === 'link' && (
              <div className="mt-2">
                <Label htmlFor="registrationProofUrl">URL</Label>
                <Input id="registrationProofUrl" type="url" {...form.register('registrationProofUrl')} />
                {form.formState.errors.registrationProofUrl && (
                  <p className="text-red-500 text-sm">{form.formState.errors.registrationProofUrl.message}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea id="observations" {...form.register('observations')} />
            {form.formState.errors.observations && (
              <p className="text-red-500 text-sm">{form.formState.errors.observations.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="running-gradient text-white hover:opacity-90 transition-opacity">
              {race ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
