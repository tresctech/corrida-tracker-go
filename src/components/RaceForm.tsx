import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Save, X, Upload, Link as LinkIcon, Plus, Trash2 } from "lucide-react";
import { RaceFormData, Race } from "@/types/race";
import { useToast } from "@/hooks/use-toast";

const kitPickupSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Horário é obrigatório"),
});

const raceSchema = z.object({
  name: z.string().min(1, "Nome da corrida é obrigatório"),
  status: z.enum(["upcoming", "completed"]),
  raceDate: z.string().min(1, "Data da corrida é obrigatória"),
  startTime: z.string().min(1, "Horário de largada é obrigatório"),
  distance: z.number().min(0.1, "Distância deve ser maior que 0"),
  kitPickupAddress: z.string().min(1, "Endereço de retirada do kit é obrigatório"),
  kitPickupDates: z.union([
    z.array(kitPickupSchema).min(1, "Pelo menos uma data de retirada é obrigatória"),
    z.literal("to-be-defined")
  ]),
  registrationProofUrl: z.string().optional(),
  registrationProofType: z.enum(["file", "link"]).optional(),
  observations: z.string().optional(),
});

interface RaceFormProps {
  race?: Race;
  onSubmit: (data: RaceFormData) => void;
  onCancel: () => void;
}

export const RaceForm = ({ race, onSubmit, onCancel }: RaceFormProps) => {
  const { toast } = useToast();
  const [raceDateOpen, setRaceDateOpen] = useState(false);
  const [raceDate, setRaceDate] = useState<Date | undefined>(race?.raceDate);
  const [isToBeDefinedKit, setIsToBeDefinedKit] = useState(race?.kitPickupDates === 'to-be-defined');

  const getDefaultKitPickupDates = () => {
    if (race?.kitPickupDates === 'to-be-defined') {
      return [];
    }
    if (race?.kitPickupDates && Array.isArray(race.kitPickupDates)) {
      return race.kitPickupDates.map(pickup => ({
        date: format(pickup.date, "yyyy-MM-dd"),
        time: pickup.time,
      }));
    }
    return [{ date: "", time: "" }];
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RaceFormData>({
    resolver: zodResolver(raceSchema),
    defaultValues: race ? {
      name: race.name,
      status: race.status,
      raceDate: format(race.raceDate, "yyyy-MM-dd"),
      startTime: race.startTime,
      distance: race.distance,
      kitPickupAddress: race.kitPickupAddress,
      kitPickupDates: race.kitPickupDates === 'to-be-defined' ? 'to-be-defined' : getDefaultKitPickupDates(),
      registrationProofUrl: race.registrationProof?.url || "",
      registrationProofType: race.registrationProof?.type || "link",
      observations: race.observations || "",
    } : {
      status: "upcoming",
      registrationProofType: "link",
      kitPickupDates: [{ date: "", time: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "kitPickupDates",
    shouldUnregister: false,
  });

  const status = watch("status");
  const registrationProofType = watch("registrationProofType");

  const onFormSubmit = async (data: RaceFormData) => {
    try {
      const formattedData = {
        ...data,
        kitPickupDates: isToBeDefinedKit ? 'to-be-defined' as const : data.kitPickupDates,
      };
      onSubmit(formattedData);
      toast({
        title: race ? "Corrida atualizada!" : "Corrida cadastrada!",
        description: `${data.name} foi ${race ? 'atualizada' : 'cadastrada'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a corrida. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setValue("registrationProofUrl", url);
      setValue("registrationProofType", "file");
    }
  };

  const handleToBeDefinedChange = (value: boolean) => {
    setIsToBeDefinedKit(value);
    if (value) {
      setValue("kitPickupDates", "to-be-defined");
    } else {
      setValue("kitPickupDates", [{ date: "", time: "" }]);
    }
  };

  return (
    <Card className="running-card max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{race ? "Editar" : "Nova"} Corrida</span>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Nome da Corrida */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Corrida *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ex: Maratona de São Paulo 2024"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status *</Label>
            <Select
              value={status}
              onValueChange={(value: "upcoming" | "completed") => setValue("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      A Fazer
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Realizada
                    </Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data e Horário da Corrida */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data da Corrida *</Label>
              <Popover open={raceDateOpen} onOpenChange={setRaceDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !raceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {raceDate ? format(raceDate, "dd/MM/yyyy") : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={raceDate}
                    onSelect={(date) => {
                      setRaceDate(date);
                      if (date) {
                        setValue("raceDate", format(date, "yyyy-MM-dd"));
                      }
                      setRaceDateOpen(false);
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.raceDate && (
                <p className="text-sm text-red-500">{errors.raceDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Horário de Largada *</Label>
              <Input
                id="startTime"
                type="time"
                {...register("startTime")}
              />
              {errors.startTime && (
                <p className="text-sm text-red-500">{errors.startTime.message}</p>
              )}
            </div>
          </div>

          {/* Distância */}
          <div className="space-y-2">
            <Label htmlFor="distance">Distância (km) *</Label>
            <Input
              id="distance"
              type="number"
              step="0.1"
              {...register("distance", { valueAsNumber: true })}
              placeholder="Ex: 21.1"
            />
            {errors.distance && (
              <p className="text-sm text-red-500">{errors.distance.message}</p>
            )}
          </div>

          {/* Endereço de Retirada do Kit */}
          <div className="space-y-2">
            <Label htmlFor="kitPickupAddress">Endereço de Retirada do Kit *</Label>
            <Textarea
              id="kitPickupAddress"
              {...register("kitPickupAddress")}
              placeholder="Ex: Shopping Ibirapuera, Av. Ibirapuera, 3103"
              rows={2}
            />
            {errors.kitPickupAddress && (
              <p className="text-sm text-red-500">{errors.kitPickupAddress.message}</p>
            )}
          </div>

          {/* Datas de Retirada do Kit */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Datas de Retirada do Kit *</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="toBeDefinedKit"
                  checked={isToBeDefinedKit}
                  onChange={(e) => handleToBeDefinedChange(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="toBeDefinedKit" className="text-sm">A Definir</Label>
              </div>
            </div>

            {!isToBeDefinedKit && Array.isArray(fields) && (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-end">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-sm">Data</Label>
                        <Input
                          type="date"
                          {...register(`kitPickupDates.${index}.date` as const)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Horário</Label>
                        <Input
                          type="time"
                          {...register(`kitPickupDates.${index}.time` as const)}
                        />
                      </div>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ date: "", time: "" })}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Data de Retirada
                </Button>
              </div>
            )}

            {isToBeDefinedKit && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  As datas de retirada do kit serão definidas posteriormente.
                </p>
              </div>
            )}

            {errors.kitPickupDates && (
              <p className="text-sm text-red-500">
                {typeof errors.kitPickupDates === 'object' && 'message' in errors.kitPickupDates 
                  ? errors.kitPickupDates.message 
                  : "Erro nas datas de retirada do kit"}
              </p>
            )}
          </div>

          {/* Comprovante de Inscrição */}
          <div className="space-y-4">
            <Label>Comprovante de Inscrição</Label>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant={registrationProofType === "link" ? "default" : "outline"}
                size="sm"
                onClick={() => setValue("registrationProofType", "link")}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Link
              </Button>
              <Button
                type="button"
                variant={registrationProofType === "file" ? "default" : "outline"}
                size="sm"
                onClick={() => setValue("registrationProofType", "file")}
              >
                <Upload className="w-4 h-4 mr-2" />
                Arquivo
              </Button>
            </div>

            {registrationProofType === "link" ? (
              <Input
                {...register("registrationProofUrl")}
                placeholder="https://exemplo.com/comprovante"
                type="url"
              />
            ) : (
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
              />
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              {...register("observations")}
              placeholder="Anotações adicionais sobre a corrida..."
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="running-gradient text-white hover:opacity-90 transition-opacity flex-1"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Salvando..." : race ? "Atualizar" : "Cadastrar"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
