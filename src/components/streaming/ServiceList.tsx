import { ServiceItem } from "./ServiceItem";
import type { StreamingService } from "@/types/streaming";

interface ServiceListProps {
  services: StreamingService[];
  selectedServices: string[];
  onServiceToggle: (serviceId: string) => void;
}

export const ServiceList = ({ services, selectedServices, onServiceToggle }: ServiceListProps) => {
  return (
    <div className="space-y-6">
      {services.map((service) => (
        <ServiceItem
          key={service.id}
          id={service.id}
          name={service.name}
          logo_url={service.logo_url}
          isSelected={selectedServices.includes(service.id)}
          onToggle={() => onServiceToggle(service.id)}
        />
      ))}
    </div>
  );
};