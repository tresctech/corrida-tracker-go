
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, FileText, ExternalLink, Edit, X, Route } from "lucide-react";
import { Race } from "@/types/race";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RaceDetailsProps {
  race: Race;
  onEdit: () => void;
  onClose: () => void;
}

export const RaceDetails = ({ race, onEdit, onClose }: RaceDetailsProps) => {
  return (
    <Card className="running-card max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-2xl">{race.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="outline" 
                className={race.status === "upcoming" 
                  ? "bg-blue-50 text-blue-700 border-blue-200" 
                  : "bg-green-50 text-green-700 border-green-200"
                }
              >
                {race.status === "upcoming" ? "A Fazer" : "Realizada"}
              </Badge>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                <Route className="w-3 h-3 mr-1" />
                {race.distance} km
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Data e Horário da Corrida */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Informações da Corrida</h3>
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Data da Corrida</p>
                <p className="text-blue-700">
                  {format(race.raceDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Horário de Largada</p>
                <p className="text-blue-700">{race.startTime}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Retirada do Kit */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Retirada do Kit</h3>
          <div className="bg-green-50 p-4 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Local</p>
                <p className="text-green-700">{race.kitPickupAddress}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Data e Horário</p>
                <p className="text-green-700">
                  {format(race.kitPickupDate, "dd/MM/yyyy")} às {race.kitPickupTime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Comprovante de Inscrição */}
        {race.registrationProof && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Comprovante de Inscrição</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Button
                  variant="outline"
                  onClick={() => window.open(race.registrationProof!.url, "_blank")}
                  className="w-full justify-start"
                >
                  {race.registrationProof.type === "file" ? (
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                  )}
                  {race.registrationProof.type === "file" 
                    ? "Ver Arquivo" 
                    : "Abrir Link"
                  }
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Observações */}
        {race.observations && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Observações</h3>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-800 whitespace-pre-wrap">{race.observations}</p>
              </div>
            </div>
          </>
        )}

        {/* Informações de Sistema */}
        <Separator />
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Criado em: {format(race.createdAt, "dd/MM/yyyy 'às' HH:mm")}</p>
          {race.updatedAt.getTime() !== race.createdAt.getTime() && (
            <p>Última atualização: {format(race.updatedAt, "dd/MM/yyyy 'às' HH:mm")}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
