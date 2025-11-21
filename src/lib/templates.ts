// Compliance Framework Templates

export interface ControlTemplate {
  framework: string;
  version: string;
  controls: Array<{
    controlId: string;
    title: string;
    description: string;
    category: string;
  }>;
}

export const complianceTemplates: ControlTemplate[] = [
  {
    framework: 'ISO 27001:2022',
    version: '2022',
    controls: [
      {
        controlId: 'A.5.1',
        title: 'Policies for information security',
        description: 'A set of policies for information security shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.',
        category: 'Organizational Controls',
      },
      {
        controlId: 'A.5.2',
        title: 'Information security roles and responsibilities',
        description: 'Information security roles and responsibilities shall be defined and allocated according to the organization needs.',
        category: 'Organizational Controls',
      },
      {
        controlId: 'A.5.3',
        title: 'Segregation of duties',
        description: 'Conflicting duties and conflicting areas of responsibility shall be segregated.',
        category: 'Organizational Controls',
      },
      {
        controlId: 'A.5.4',
        title: 'Management responsibilities',
        description: 'Management shall require all personnel to apply information security in accordance with the established information security policy, topic-specific policies and procedures of the organization.',
        category: 'Organizational Controls',
      },
      {
        controlId: 'A.5.7',
        title: 'Threat intelligence',
        description: 'Information relating to information security threats shall be collected and analyzed to produce threat intelligence.',
        category: 'Organizational Controls',
      },
      {
        controlId: 'A.8.1',
        title: 'User endpoint devices',
        description: 'Information stored on, processed by or accessible via user endpoint devices shall be protected.',
        category: 'Technological Controls',
      },
      {
        controlId: 'A.8.2',
        title: 'Privileged access rights',
        description: 'The allocation and use of privileged access rights shall be restricted and managed.',
        category: 'Technological Controls',
      },
      {
        controlId: 'A.8.3',
        title: 'Information access restriction',
        description: 'Access to information and other associated assets shall be restricted in accordance with the established topic-specific policy on access control.',
        category: 'Technological Controls',
      },
      {
        controlId: 'A.8.5',
        title: 'Secure authentication',
        description: 'Secure authentication technologies and procedures shall be implemented based on information access restrictions and the topic-specific policy on access control.',
        category: 'Technological Controls',
      },
      {
        controlId: 'A.8.8',
        title: 'Management of technical vulnerabilities',
        description: 'Information about technical vulnerabilities of information systems in use shall be obtained, the organization\'s exposure to such vulnerabilities shall be evaluated and appropriate measures shall be taken.',
        category: 'Technological Controls',
      },
    ],
  },
  {
    framework: 'ISO 27017:2015',
    version: '2015',
    controls: [
      {
        controlId: 'CLD.6.3.1',
        title: 'Shared roles and responsibilities',
        description: 'The cloud service provider and cloud service customer shall clearly identify and document their individual and shared information security roles and responsibilities.',
        category: 'Cloud Service Provider',
      },
      {
        controlId: 'CLD.8.1.5',
        title: 'Removal or return of cloud service customer assets upon termination',
        description: 'The cloud service provider shall have procedures to ensure the timely return or secure disposal of cloud service customer assets upon termination of agreement.',
        category: 'Asset Management',
      },
      {
        controlId: 'CLD.9.5.1',
        title: 'Virtual computing environment security',
        description: 'The allocation and use of resources in virtual computing environments shall be controlled.',
        category: 'Access Control',
      },
      {
        controlId: 'CLD.12.1.5',
        title: 'Availability of cloud services',
        description: 'The availability of cloud services shall be managed through the implementation of controls to mitigate the effects of cloud service failures.',
        category: 'Operations Security',
      },
      {
        controlId: 'CLD.12.4.5',
        title: 'Monitoring of cloud service customer virtual machines',
        description: 'Cloud service providers shall implement appropriate monitoring of cloud service customer virtual machines.',
        category: 'Operations Security',
      },
    ],
  },
  {
    framework: 'ISO 27018:2019',
    version: '2019',
    controls: [
      {
        controlId: 'PII.1',
        title: 'Consent and choice',
        description: 'The cloud service provider shall obtain explicit consent from the cloud service customer for processing PII.',
        category: 'Privacy Controls',
      },
      {
        controlId: 'PII.2',
        title: 'Purpose legitimacy and specification',
        description: 'The purposes for which PII is collected and processed shall be identified and documented.',
        category: 'Privacy Controls',
      },
      {
        controlId: 'PII.3',
        title: 'Collection limitation',
        description: 'The collection of PII shall be limited to the minimum necessary for the specified purposes.',
        category: 'Privacy Controls',
      },
      {
        controlId: 'PII.4',
        title: 'Data minimization',
        description: 'PII shall be minimized to only what is necessary for the purposes identified.',
        category: 'Privacy Controls',
      },
      {
        controlId: 'PII.5',
        title: 'Use, retention and disclosure limitation',
        description: 'PII shall not be used, retained or disclosed for purposes other than those specified.',
        category: 'Privacy Controls',
      },
    ],
  },
  {
    framework: 'RBI IT Outsourcing',
    version: '2023',
    controls: [
      {
        controlId: 'RBI.1',
        title: 'Board Approved Policy',
        description: 'The Regulated Entity (RE) shall have a Board approved policy on IT outsourcing.',
        category: 'Governance',
      },
      {
        controlId: 'RBI.2',
        title: 'Risk Assessment',
        description: 'REs shall conduct comprehensive risk assessment before outsourcing any IT service.',
        category: 'Risk Management',
      },
      {
        controlId: 'RBI.3',
        title: 'Due Diligence of Service Providers',
        description: 'REs shall conduct adequate due diligence of the service provider.',
        category: 'Vendor Management',
      },
      {
        controlId: 'RBI.4',
        title: 'Contractual Agreement',
        description: 'Outsourcing arrangements shall be governed by written contracts.',
        category: 'Contracts',
      },
      {
        controlId: 'RBI.5',
        title: 'Data Security and Confidentiality',
        description: 'Service providers shall maintain adequate data security and confidentiality measures.',
        category: 'Security',
      },
      {
        controlId: 'RBI.6',
        title: 'Right to Audit',
        description: 'REs shall reserve the right to audit the service provider.',
        category: 'Audit',
      },
      {
        controlId: 'RBI.7',
        title: 'Business Continuity Plan',
        description: 'Service providers shall have robust business continuity and disaster recovery plans.',
        category: 'Business Continuity',
      },
    ],
  },
  {
    framework: 'DPDP Act - SAR',
    version: '2023',
    controls: [
      {
        controlId: 'SAR.1',
        title: 'Request Acknowledgment',
        description: 'Acknowledge data subject access requests within specified timeframe.',
        category: 'Subject Access Rights',
      },
      {
        controlId: 'SAR.2',
        title: 'Identity Verification',
        description: 'Verify the identity of the data subject making the request.',
        category: 'Subject Access Rights',
      },
      {
        controlId: 'SAR.3',
        title: 'Data Retrieval',
        description: 'Retrieve all personal data related to the data subject.',
        category: 'Subject Access Rights',
      },
      {
        controlId: 'SAR.4',
        title: 'Response Delivery',
        description: 'Provide the requested information in a commonly used electronic format.',
        category: 'Subject Access Rights',
      },
      {
        controlId: 'SAR.5',
        title: 'Exemptions Handling',
        description: 'Apply appropriate exemptions where legally permitted.',
        category: 'Subject Access Rights',
      },
    ],
  },
  {
    framework: 'DPDP Act - IT RA',
    version: '2023',
    controls: [
      {
        controlId: 'ITRA.1',
        title: 'Risk Identification',
        description: 'Identify and document IT-related risks to personal data processing.',
        category: 'Risk Assessment',
      },
      {
        controlId: 'ITRA.2',
        title: 'Likelihood and Impact Analysis',
        description: 'Assess the likelihood and impact of identified risks.',
        category: 'Risk Assessment',
      },
      {
        controlId: 'ITRA.3',
        title: 'Control Implementation',
        description: 'Implement appropriate technical and organizational measures.',
        category: 'Risk Assessment',
      },
      {
        controlId: 'ITRA.4',
        title: 'Residual Risk Evaluation',
        description: 'Evaluate and document residual risks after controls implementation.',
        category: 'Risk Assessment',
      },
      {
        controlId: 'ITRA.5',
        title: 'Regular Review',
        description: 'Review and update risk assessments at regular intervals.',
        category: 'Risk Assessment',
      },
    ],
  },
];

// Vendor Risk Questionnaire Template
export const vendorQuestionnaireTemplate = {
  sections: [
    {
      title: 'Company Information',
      questions: [
        {
          id: 'company_name',
          question: 'Company Legal Name',
          type: 'text',
          required: true,
        },
        {
          id: 'company_address',
          question: 'Registered Address',
          type: 'textarea',
          required: true,
        },
        {
          id: 'years_in_business',
          question: 'Years in Business',
          type: 'number',
          required: true,
        },
      ],
    },
    {
      title: 'Information Security',
      questions: [
        {
          id: 'iso_certified',
          question: 'Is your organization ISO 27001 certified?',
          type: 'radio',
          options: ['Yes', 'No', 'In Progress'],
          required: true,
        },
        {
          id: 'security_policy',
          question: 'Do you have documented information security policies?',
          type: 'radio',
          options: ['Yes', 'No'],
          required: true,
        },
        {
          id: 'incident_response',
          question: 'Do you have an incident response plan?',
          type: 'radio',
          options: ['Yes', 'No'],
          required: true,
        },
        {
          id: 'encryption',
          question: 'Is data encrypted at rest and in transit?',
          type: 'radio',
          options: ['Yes', 'No', 'Partially'],
          required: true,
        },
      ],
    },
    {
      title: 'Data Privacy',
      questions: [
        {
          id: 'privacy_policy',
          question: 'Do you have a documented privacy policy?',
          type: 'radio',
          options: ['Yes', 'No'],
          required: true,
        },
        {
          id: 'data_processing',
          question: 'How do you process personal data?',
          type: 'textarea',
          required: true,
        },
        {
          id: 'gdpr_compliance',
          question: 'Are you GDPR compliant?',
          type: 'radio',
          options: ['Yes', 'No', 'Not Applicable'],
          required: true,
        },
      ],
    },
    {
      title: 'Business Continuity',
      questions: [
        {
          id: 'bc_plan',
          question: 'Do you have a Business Continuity Plan?',
          type: 'radio',
          options: ['Yes', 'No'],
          required: true,
        },
        {
          id: 'backup_frequency',
          question: 'How frequently are backups performed?',
          type: 'select',
          options: ['Daily', 'Weekly', 'Monthly', 'No regular backups'],
          required: true,
        },
        {
          id: 'rto_rpo',
          question: 'What are your RTO and RPO targets?',
          type: 'textarea',
          required: false,
        },
      ],
    },
  ],
};