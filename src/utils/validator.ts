interface ErrorType {
  field: string;
  message: string;
}
interface ValidationCriteria {
  [key: string]: {
    isRequired?: boolean;
    message: string;
    expression?: boolean;
  };
}

export function validator(
  dataObj: { [key: string]: any },
  criteriaObj: ValidationCriteria
): {
  errors: ErrorType[];
  hasError: boolean;
  concatenatedErrorMessage: string | null;
} {
  const errors: ErrorType[] = [];
  Object.keys(dataObj).forEach((key) => {
    if (typeof criteriaObj[key] == "object" && criteriaObj[key] !== null) {
      if (criteriaObj?.[key]?.isRequired == true && !dataObj[key]) {
        !errors.find((err) => key == err.field) &&
          errors.push({
            field: key,
            message: criteriaObj[key].message,
          });
      }
      if (
        criteriaObj[key].hasOwnProperty("expression") &&
        !criteriaObj[key]?.expression
      ) {
        !errors.find((err) => key == err.field) &&
          errors.push({
            field: key,
            message: criteriaObj[key].message,
          });
      }
    }
  });

  return {
    errors,
    hasError: errors.length > 0,
    concatenatedErrorMessage: errors.map((error) => error.message).join(", "),
  };
}
