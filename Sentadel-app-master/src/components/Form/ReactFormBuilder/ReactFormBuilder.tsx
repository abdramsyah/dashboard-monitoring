/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { FlatList, View } from 'react-native';
import {
  FieldValues,
  FormProvider,
  UseFormReturn,
  UseFormWatch
} from 'react-hook-form';
import ReactFormInput from '../ReactFormInput/ReactFormInput';
import DisposableContainer from '../DisposableContainer/DisposableContainer';
import FieldArrayContainer from '../FieldArrayContainer/FieldArrayContainer';
import Button, { ButtonProps } from '@sentadell-src/components/Button/Button';
import TextBase from '@sentadell-src/components/Text/TextBase';
import { ReactFormType } from '@sentadell-src/types/reactForm';
import { screenWidth } from '@sentadell-src/config/Sizes';
import Colors from '@sentadell-src/config/Colors';
import ReactFormDropdown, {
  ReactFormDynamicDropdownRef
} from '../ReactFormDropdown/ReactFormDropdown';
import { useDispatch } from 'react-redux';
import {
  setHookIsAppended,
  setHookIsRemoved
} from '@sentadell-src/stores/rtk/actions/hookForm';
import styles from './ReactFormBuilder.styles';

export type isFieldArrayType = {
  isFieldArray?: boolean;
  ref?: React.Ref<ReactFormDynamicDropdownRef>;
};

export type ReactFormBuilderProps<
  Tdata = any,
  Tenum = any,
  Tform extends FieldValues = any
> =
  | {
      grouped?: false;
      wrapped?: false;
      methods: UseFormReturn<Tform>;
      formList: ReactFormType<Tenum>[];
      onSubmit: (form: Tdata) => void;
      buttonProps?: Omit<ButtonProps, 'onPress' | 'isLoading'>;
      isLoading?: boolean;
      flatlistRef?: React.RefObject<FlatList<any>>;
    }
  | {
      grouped?: false;
      wrapped: true;
      methods: UseFormReturn<Tform>;
      formList: ReactFormType<Tenum>[][];
      onSubmit: (form: Tdata) => void;
      buttonProps?: Omit<ButtonProps, 'onPress' | 'isLoading'>;
      isLoading?: boolean;
    }
  | {
      grouped: true;
      wrapped?: false;
      methods: UseFormReturn<Tform>;
      formList: (
        watch: UseFormWatch<Tform>
      ) => { title: string; form: ReactFormType<Tenum>[] }[];
      onSubmit: (form: Tdata) => void;
      buttonProps?: Omit<ButtonProps, 'onPress' | 'isLoading'>;
      isLoading?: boolean;
    }
  | {
      grouped: true;
      wrapped: true;
      methods: UseFormReturn<Tform>;
      formList: {
        title: string;
        form: ReactFormType<Tenum>[][] | ReactFormType<Tenum>[];
      }[];
      onSubmit: (form: Tdata) => void;
      buttonProps?: Omit<ButtonProps, 'onPress' | 'isLoading'>;
      isLoading?: boolean;
    };

const ReactFormBuilder: React.FC<ReactFormBuilderProps> = (
  props: ReactFormBuilderProps
) => {
  const {
    methods,
    grouped,
    wrapped,
    formList,
    onSubmit,
    buttonProps,
    isLoading
  } = props;

  const dispatch = useDispatch();

  const enhancedButtonCustomStyle: Omit<
    ButtonProps,
    'onPress' | 'isLoading'
  >['customStyle'] = {
    container: {
      position: 'absolute',
      bottom: 0,
      padding: 20,
      width: screenWidth,
      backgroundColor: Colors.base.fullWhite
    }
  };

  const enhancedButtonProps: Omit<ButtonProps, 'onPress'> = {
    ...buttonProps,
    theme: buttonProps?.theme || 'solid-blue',
    title: buttonProps?.title || 'Submit',
    customStyle: buttonProps?.customStyle || enhancedButtonCustomStyle
  };

  const {
    handleSubmit,
    watch,
    formState: { errors }
  } = methods;

  const renderForm = (faProps?: isFieldArrayType) => {
    const realForm: any = (form: ReactFormType<any>, idx: number) => {
      if (form.hide) return null;

      if (form.formType.type === 'input')
        return (
          <ReactFormInput
            key={idx.toString()}
            outlined
            name={form.name}
            rules={form.rules}
            label={form.formType.label}
            inputProps={{
              editable: form.formType.disabled,
              placeholder: form.formType.placeholder,
              keyboardType: form.formType.keyboardType
            }}
            customStyle={form.formType.customStyle}
          />
        );

      if (form.formType.type === 'select') {
        return (
          <ReactFormDropdown
            ref={faProps?.isFieldArray ? faProps?.ref : form.formType.ref}
            key={idx.toString()}
            name={form.name}
            rules={form.rules}
            returnedKey={form.formType.returnedKey}
            dropdownProps={{
              isMultiple: form.formType.isMultiple,
              label: form.formType.label,
              title: form.formType.title,
              options: form.formType.options,
              containerStyle: form.formType.containerStyle,
              enableSearch: form.formType.enableSearch,
              disabled: form.formType.disabled,
              dynamicOptions: form.formType.dynamicOptions
            }}
            customOnChange={form.formType.customOnChange}
          />
        );
      }

      if (form.formType.type === 'fieldArray') {
        const {
          form: forms,
          fieldArray: { fields, append, remove },
          title,
          max,
          min,
          shouldFocus,
          useIndex,
          appendCopy = true,
          onCheck,
          refObj
        } = form.formType;
        const disposeDisabled = fields.length === (min ?? 1);
        const addDisabled = fields.length === (max || 5);

        const onPressAdd = () => {
          if (appendCopy && fields.length) {
            const fieldData = fields[fields.length - 1] as any;

            if (appendCopy instanceof Array) {
              let dummy = {};

              appendCopy.forEach(e => {
                dummy = { ...dummy, [e]: fieldData[e] };
              });
              append(dummy, { shouldFocus });
            } else {
              append(fieldData, { shouldFocus });
            }
          } else {
            append({}, { shouldFocus });
          }
          dispatch(setHookIsAppended(true));
        };

        return (
          <FieldArrayContainer
            title={title}
            onPressAdd={onPressAdd}
            disabled={addDisabled}>
            {fields.map((field, index) => (
              <DisposableContainer
                key={field.id}
                id={field.id}
                index={useIndex ? index : undefined}
                onCheck={onCheck}
                onPress={() => {
                  remove(index);
                  dispatch(
                    setHookIsRemoved({ isRemoved: true, key: field.id })
                  );
                }}
                disabled={disposeDisabled}>
                {forms.map((faForm: ReactFormType, faIdx: number) => {
                  const newForm: ReactFormType = {
                    ...faForm,
                    name: `${form.name}.${index}.${faForm.name}`,
                    refName: field.id
                  };

                  if (refObj && refObj[faForm.name])
                    return renderForm({
                      isFieldArray: true,
                      ref: refObj[faForm.name]?.current[field.id]
                    })(newForm, faIdx);

                  return renderForm()(newForm, faIdx);
                })}
              </DisposableContainer>
            ))}
          </FieldArrayContainer>
        );
      }

      if (form.formType.type === 'dynamic') {
        const splitName = form.name.split('.') as string[];
        let actualName = form.formType.listenTo;

        if (splitName.length > 1) {
          const actualIndex = splitName[splitName.length - 2];

          actualName = [
            ...splitName.slice(0, splitName.length - 2),
            actualIndex,
            form.formType.listenTo
          ].join('.');
        }

        const condition = form.formType.condition;
        const dynamicCondition = () => {
          if (condition) {
            return methods.watch(actualName) === condition;
          }

          return methods.watch(actualName);
        };

        if (dynamicCondition()) {
          const newForm: ReactFormType = {
            ...form,
            formType: form.formType.form1
          };

          return renderForm()(newForm, idx);
        } else {
          const newForm: ReactFormType = {
            ...form,
            formType: form.formType.form2
          };

          return renderForm()(newForm, idx);
        }
      }

      return null;
    };

    return realForm;
  };

  if (grouped) {
    if (wrapped) {
      const shownGroupList = formList.map(group => ({
        title: group.title,
        form: group.form.filter(wrap => {
          if (wrap instanceof Array)
            return wrap.filter(form => form.formType.type !== 'notShown');

          return wrap.formType.type !== 'notShown';
        })
      }));

      return (
        <FormProvider {...methods}>
          {shownGroupList.map((group, idx) => {
            return (
              <View key={idx.toString()} style={styles.groupContainer}>
                <TextBase.XL style={styles.groupTitle}>
                  {group.title}
                </TextBase.XL>
                {group.form.map((wrap, wIdx) => (
                  <View key={wIdx.toString()} style={styles.wrapContainer}>
                    {wrap instanceof Array
                      ? wrap.map(renderForm())
                      : renderForm()(wrap, idx)}
                  </View>
                ))}
              </View>
            );
          })}
          <Button
            {...enhancedButtonProps}
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={
              buttonProps?.disabled ||
              !shownGroupList.every(group => {
                return group.form.every(wrap => {
                  if (wrap instanceof Array)
                    return wrap.every(form => {
                      if (form.hide) return true;
                      if (!form.rules?.required) return true;

                      const val = watch(form.name);

                      if (val instanceof Array) return !!val.length;

                      return !!val;
                    });
                  if (wrap.hide) return true;

                  const val = watch(wrap.name);

                  if (val instanceof Array) return !!val.length;

                  return !!val;
                });
              }) ||
              shownGroupList.some(group =>
                group.form.some(wrap => {
                  if (wrap instanceof Array)
                    return wrap.some(form => !!errors[form.name]);

                  return !!errors[wrap.name];
                })
              )
            }
          />
        </FormProvider>
      );
    }

    const shownGroupList = formList(methods.watch).filter(e =>
      e.form.map(e1 => e1.formType.type !== 'notShown')
    );

    return (
      <FormProvider {...methods}>
        {shownGroupList.map((group, idx) => {
          return (
            <View key={idx.toString()} style={styles.groupContainer}>
              <TextBase.XL style={styles.groupTitle}>{group.title}</TextBase.XL>
              {group.form.map(renderForm())}
            </View>
          );
        })}
        <Button
          {...enhancedButtonProps}
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          disabled={
            buttonProps?.disabled ||
            !shownGroupList.every(group => {
              return group.form.every(form => {
                if (form.hide) return true;
                if (!form.rules?.required) return true;

                const val = watch(form.name);

                if (val instanceof Array) return !!val.length;

                return !!val;
              });
            }) ||
            shownGroupList.some(group =>
              group.form.some(form => !!errors[form.name])
            )
          }
        />
      </FormProvider>
    );
  }

  if (wrapped) return null;

  const shownFormList = formList.filter(e => e.formType.type !== 'notShown');

  return (
    <FormProvider {...methods}>
      <FlatList
        ref={props.flatlistRef}
        data={shownFormList}
        contentContainerStyle={styles.baseContentContainerStyle}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => renderForm()(item, index)}
      />
      <Button
        {...enhancedButtonProps}
        onPress={handleSubmit(onSubmit)}
        isLoading={isLoading}
        disabled={
          buttonProps?.disabled ||
          !shownFormList.every(e => {
            if (e.hide) return true;
            if (!e.rules?.required && e.formType.type !== 'fieldArray')
              return true;

            if (e.formType.type === 'fieldArray') {
              const { form, fieldArray } = e.formType;

              const fieldCheck = fieldArray.fields.every((_, index) => {
                const formCheck = form.every(faForm => {
                  const faVal =
                    watch(`${e.name}.${index}.${faForm.name}`) ||
                    !faForm.rules?.required;

                  if (faVal) return !!faVal;
                });

                return formCheck;
              });

              return fieldCheck;
            }

            const val = watch(e.name);

            if (val instanceof Array) return val?.length;

            return val;
          }) ||
          shownFormList.some(e => !!errors[e.name])
        }
      />
    </FormProvider>
  );
};

export default ReactFormBuilder;
