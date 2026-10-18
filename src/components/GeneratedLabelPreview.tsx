import React from 'react';
import { LabelPreview, LabelPreviewProps } from './LabelPreview';

export type GeneratedLabelPreviewProps = LabelPreviewProps;

export const GeneratedLabelPreview: React.FC<GeneratedLabelPreviewProps> = (props) => {
  return <LabelPreview {...props} />;
};

export default GeneratedLabelPreview;

