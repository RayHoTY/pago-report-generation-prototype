import { Prisma } from '@prisma/client';
import { convertDateObjToISO8601noTZ } from './shared.helpers.service';

export const toUnassignedThreatsTableFormat = (result: Prisma.ThreatCreateInput) => {
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };
  return {
    id: result.id,
    sha256: result.sha256,
    deviceName: result.deviceName,
    deviceState: result.deviceState,
    tenantName: result.tenantName, // TODO: update to actual tenant name when tenant service is up.
    lastFound: convertDateObjToISO8601noTZ(result.lastFound as Date),
    filePath: result.filePath,
    fileSize: formatFileSize(result.fileSize as number),
    fileStatus: result.fileStatus,
    ipAddresses: JSON.parse(result.ipAddresses),
    macAddresses: JSON.parse(result.macAddresses),
    agentVersion: result.agentVersion,
    detectedBy: result.detectedBy,
    cylanceScore: Math.round(Number(result.cylanceScore) * -100),
    certPublisher: result.certPublisher,
    classification: result.classification,
    globalQuarantined: result.globalQuarantined,
    safelisted: result.safelisted
  };
};
