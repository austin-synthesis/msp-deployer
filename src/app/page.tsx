"use client";

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { Switch, TextField, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import YAML from 'yaml';

const Home = () => {
  const [yamlText, setYamlText] = useState('');
  const [formFields, setFormFields] = useState([]);

  const generateFormFields = () => {
    try {
      const parsedYaml = YAML.parse(yamlText);
      const fields = createFormFields(parsedYaml);
      setFormFields(fields);
    } catch (error) {
      console.error('Error parsing YAML:', error);
    }
  };

  const createFormFields = (data, prefix = '') => {
    const fields = [];
  
    const handleField = (key, value) => {
      const fieldName = prefix + key;
      const fieldType = getFieldType(value);
      const fieldLabel = capitalize(key.replace(/_/g, ' '));
      const fieldValue = fieldType === 'switch' ? value === 'true' : value;
      fields.push({ name: fieldName, type: fieldType, label: fieldLabel, value: fieldValue });
    };
  
    const processObject = (obj, prefix) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object') {
          const accordionTitle = capitalize(key.replace(/_/g, ' '));
          fields.push({ name: prefix + key, type: 'accordion', label: accordionTitle, value: obj[key] });
        } else {
          handleField(`${prefix}${key}`, obj[key]);
        }
      }
    };
  
    processObject(data, '');
  
    return fields;
  };

  const getFieldType = (value) => {
    if (typeof value === 'boolean') {
      return 'switch';
    } else if (Array.isArray(value)) {
      return 'tags';
    } else if (!isNaN(value)) {
      return 'number';
    } else if (value.includes('@') && value.includes('.')) {
      return 'email';
    } else {
      return 'text';
    }
  };
  

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleYamlInputChange = (event) => {
    setYamlText(event.target.value);
  };

  const renderFormField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <TextField
            key={field.name}
            name={field.name}
            label={field.label}
            fullWidth
            variant="outlined"
            defaultValue={field.value}
            style={{ marginBottom: '1rem' }}
            InputLabelProps={{ shrink: true }}
          />
        );
      case 'switch':
        return (
          <div key={field.name} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            <Typography>{field.label}</Typography>
            <Switch
              defaultChecked={field.value === 'true' ? true : false}
              color="primary"
              inputProps={{ 'aria-label': field.label }}
            />
          </div>
        )
      case 'tags':
        return (
          <div key={field.name} style={{ marginBottom: '1rem' }}>
            <Typography>{field.label}</Typography>
            {field.value.map((tag, index) => (
              <Typography key={index} variant="body2" style={{ marginLeft: '1rem' }}>
                {tag}
              </Typography>
            ))}
          </div>
        );
      case 'number':
        return (
          <TextField
            key={field.name}
            name={field.name}
            label={field.label}
            fullWidth
            variant="outlined"
            type="number"
            defaultValue={field.value}
            style={{ marginBottom: '1rem' }}
            InputLabelProps={{ shrink: true }}
          />
        );
      case 'email':
        return (
          <TextField
            key={field.name}
            name={field.name}
            label={field.label}
            fullWidth
            variant="outlined"
            type="email"
            defaultValue={field.value}
            style={{ marginBottom: '1rem' }}
            InputLabelProps={{ shrink: true }}
          />
        );
        case 'accordion':
          return (
            <Accordion key={field.name} style={{ marginBottom: '1rem' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ fontWeight: 'bold' }}>
                {field.label}
              </AccordionSummary>
              <AccordionDetails>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  {createFormFields(field.value, field.name + '.').map((nestedField, index) => (
                    <React.Fragment key={index}>{renderFormField(nestedField)}</React.Fragment>
                  ))}
                </div>
              </AccordionDetails>
            </Accordion>
          );        
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <Typography variant="h5" style={{ marginBottom: '1rem' }}>
        Generate Form from YAML
      </Typography>
      <TextField
        multiline
        rows={8}
        fullWidth
        label="Enter YAML"
        value={yamlText}
        onChange={handleYamlInputChange}
        placeholder="Enter YAML here"
        variant="outlined"
        style={{ marginBottom: '1rem' }}
      />
      <Button variant="contained" color="primary" onClick={generateFormFields}>
        Generate
      </Button>
      {formFields.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <Typography variant="h6" style={{ marginBottom: '1rem' }}>
            Generated Form Fields:
          </Typography>
          <Accordion style={{ marginBottom: '1rem' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ fontWeight: 'bold' }}>
              View Form Fields
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {formFields.map((field, index) => (
                  <React.Fragment key={index}>{renderFormField(field)}</React.Fragment>
                ))}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default Home;
