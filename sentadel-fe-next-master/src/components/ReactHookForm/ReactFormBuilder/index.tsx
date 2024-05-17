import React from "react";
import {
  FieldValues,
  FormProvider,
  UseFormReturn,
  UseFormWatch,
} from "react-hook-form";
import ReactInput from "../ReactInput";
import { ReactFormType } from "@/types/reactForm";
import ReactSelect from "../ReactSelect";
import ReactButton, { ReactButtonProps } from "../ReactButton";
import ReactChipSelector from "../ReactChipSelector";
import DisposableContainer from "../DisposableContainer";
import FieldArrayContainer from "../FieldArrayContainer";
import { ChipSelectorOption } from "@/components/ChipSelector";

export type ReactFormBuilder<
  Tdata = any,
  Tenum = any,
  Tlist = any[],
  Tform extends FieldValues = any
> =
  | {
      grouped?: false;
      wrapped?: false;
      methods: UseFormReturn<Tform>;
      formList: (watch: UseFormWatch<Tform>) => ReactFormType<Tenum, Tlist>[];
      onSubmit: (form: Tdata) => void;
      buttonProps?: ReactButtonProps;
    }
  | {
      grouped?: false;
      wrapped: true;
      methods: UseFormReturn<Tform>;
      formList: (watch: UseFormWatch<Tform>) => ReactFormType<Tenum, Tlist>[][];
      onSubmit: (form: Tdata) => void;
      buttonProps?: ReactButtonProps;
    }
  | {
      grouped: true;
      wrapped?: false;
      methods: UseFormReturn<Tform>;
      formList: (
        watch: UseFormWatch<Tform>
      ) => { title: string; form: ReactFormType<Tenum, Tlist>[] }[];
      onSubmit: (form: Tdata) => void;
      buttonProps?: ReactButtonProps;
    }
  | {
      grouped: true;
      wrapped: true;
      methods: UseFormReturn<Tform>;
      formList: (watch: UseFormWatch<Tform>) => {
        title: string;
        form: ReactFormType<Tenum, Tlist>[][] | ReactFormType<Tenum, Tlist>[];
      }[];
      onSubmit: (form: Tdata) => void;
      buttonProps?: ReactButtonProps;
    };

const ReactFormBuilder: React.FC<ReactFormBuilder> = (
  props: ReactFormBuilder
) => {
  const { methods, grouped, wrapped, formList, onSubmit, buttonProps } = props;

  const {
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;

  const renderForm: (form: ReactFormType, idx: number) => any = (form, idx) => {
    if (form.hide) return null;

    if (form.formType.type === "input")
      return (
        <ReactInput
          key={idx.toString()}
          className={form.formType.className}
          type={form.formType.inputType}
          name={form.name}
          rules={form.rules}
          label={form.formType.label}
          disabled={form.formType.disabled}
          placeholder={form.formType.placeholder}
          reactInputType={form.formType.reactInputType}
        />
      );

    if (form.formType.type === "select")
      return (
        <ReactSelect
          key={idx.toString()}
          name={form.name}
          rules={form.rules}
          title={form.formType.label}
          data={form.formType.selectData || []}
          customLabel={form.formType.customLabel}
          returnedKey={form.formType.returnedKey}
          customStyle={form.formType.customStyle}
        />
      );

    if (form.formType.type === "chipSelector")
      return (
        <ReactChipSelector
          key={idx.toString()}
          name={form.name}
          rules={form.rules}
          chipSelectorProps={{
            isMultiple: form.formType.isMultiple,
            options: form.formType.options,
            title: form.formType.title,
          }}
          returnedKey={form.formType.returnedKey}
        />
      );

    if (form.formType.type === "fieldArray") {
      const {
        form: forms,
        fieldArray: { fields, append, remove },
        title,
        max,
        min,
        shouldFocus,
        useIndex,
      } = form.formType;
      const disposeDisabled = fields.length === (min || 1);
      const addDisabled = fields.length === (max || 5);

      return (
        <FieldArrayContainer
          key={idx.toString()}
          title={title}
          onClickAdd={() => append(fields[fields.length - 1], { shouldFocus })}
          disabled={addDisabled}
        >
          {fields.map((field, index) => (
            <DisposableContainer
              key={field.id}
              index={useIndex ? index + 1 : undefined}
              onClick={() => remove(index)}
              disabled={disposeDisabled}
            >
              {forms.map((faForm: ReactFormType, faIdx: number) => {
                const newForm: ReactFormType = {
                  ...faForm,
                  name: `${form.name}.${index}.${faForm.name}`,
                };

                return renderForm(newForm, faIdx);
              })}
            </DisposableContainer>
          ))}
        </FieldArrayContainer>
      );
    }

    if (form.formType.type === "dynamic") {
      const splitName = form.name.split(".") as string[];
      let actualName = form.formType.listenTo;

      if (splitName.length > 1) {
        const actualIndex = splitName[splitName.length - 2];

        actualName = [
          ...splitName.slice(0, splitName.length - 2),
          actualIndex,
          form.formType.listenTo,
        ].join(".");
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
          formType: form.formType.form1,
        };

        return renderForm(newForm, idx);
      } else {
        const newForm: ReactFormType = {
          ...form,
          formType: form.formType.form2,
        };

        return renderForm(newForm, idx);
      }
    }

    if (form.formType.type === "autoHide") {
      const splitName = form.name.split(".") as string[];
      let actualName = form.formType.listenTo;

      if (splitName.length > 1) {
        const actualIndex = splitName[splitName.length - 2];

        actualName = [
          ...splitName.slice(0, splitName.length - 2),
          actualIndex,
          form.formType.listenTo,
        ].join(".");
      }

      const condition = form.formType.condition;
      const targetType = form.formType.targetType;
      const targetKey = form.formType.targetKey;
      const dynamicCondition = () => {
        if (targetType && condition) {
          if (targetType === "chipSelector" && targetKey) {
            const valueWathcer: ChipSelectorOption[] | undefined =
              methods.watch(actualName);
            return valueWathcer?.some(
              (e: ChipSelectorOption) =>
                e[targetKey as keyof ChipSelectorOption] === condition
            );
          }
          if (targetType === "select" && targetKey) {
            const valueWathcer: any[] = methods.watch(actualName);
            return valueWathcer.some((e: any) => (e[targetKey] = condition));
          }
          if (targetType === "input")
            return methods.watch(actualName) === condition;
        }

        if (!targetType && condition) {
          return methods.watch(actualName) === condition;
        }

        return methods.watch(actualName);
      };

      if (dynamicCondition()) {
        const newForm: ReactFormType = {
          ...form,
          formType: form.formType.form,
        };

        return renderForm(newForm, idx);
      }
    }
  };

  if (grouped) {
    if (wrapped) {
      const shownGroupList = formList(methods.watch).map((group) => ({
        title: group.title,
        form: group.form.filter((wrap) => {
          if (wrap instanceof Array)
            return wrap.filter((form) => form.formType.type !== "notShown");

          return wrap.formType.type !== "notShown";
        }),
      }));

      return (
        <FormProvider {...methods}>
          <div className="react-form-builder">
            <form onSubmit={handleSubmit(onSubmit)} className="form-input">
              {shownGroupList.map((group, idx) => {
                return (
                  <div key={idx.toString()} className="group-container">
                    <div className="group-title">{group.title}</div>
                    {group.form.map((wrap, wIdx) => (
                      <div key={wIdx.toString()} className="field-row">
                        {wrap instanceof Array
                          ? wrap.map(renderForm)
                          : renderForm(wrap, idx)}
                      </div>
                    ))}
                  </div>
                );
              })}
              <ReactButton
                title={buttonProps?.title || "Submit"}
                type="submit"
                loading={buttonProps?.loading}
                disabled={
                  buttonProps?.disabled ||
                  !shownGroupList.every((group) => {
                    return group.form.every((wrap) => {
                      if (wrap instanceof Array)
                        return wrap.every((form) => {
                          if (form.hide) return true;

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
                  shownGroupList.some((group) =>
                    group.form.some((wrap) => {
                      if (wrap instanceof Array)
                        return wrap.some((form) => !!errors[form.name]);

                      return !!errors[wrap.name];
                    })
                  )
                }
                customClassName={buttonProps?.customClassName}
              />
            </form>
          </div>
        </FormProvider>
      );
    }

    const shownGroupList = formList(methods.watch).filter((e) =>
      e.form.map((e1) => e1.formType.type !== "notShown")
    );

    return (
      <FormProvider {...methods}>
        <div className="react-form-builder">
          <form onSubmit={handleSubmit(onSubmit)} className="form-input">
            {shownGroupList.map((group, idx) => {
              return (
                <div key={idx.toString()} className="group-container">
                  <div className="group-title">{group.title}</div>
                  {group.form.map(renderForm)}
                </div>
              );
            })}
            <ReactButton
              title={buttonProps?.title || "Submit"}
              type="submit"
              loading={buttonProps?.loading}
              disabled={
                buttonProps?.disabled ||
                !shownGroupList.every((group) => {
                  return group.form.every((form) => {
                    if (form.hide) return true;

                    const val = watch(form.name);
                    if (val instanceof Array) return !!val.length;

                    return !!val;
                  });
                }) ||
                shownGroupList.some((group) =>
                  group.form.some((form) => !!errors[form.name])
                )
              }
              customClassName={buttonProps?.customClassName}
            />
          </form>
        </div>
      </FormProvider>
    );
  }

  if (wrapped) return null;

  const shownFormList = formList(methods.watch).filter(
    (e) => e.formType.type !== "notShown"
  );

  return (
    <FormProvider {...methods}>
      <div className="react-form-builder">
        <form onSubmit={handleSubmit(onSubmit)} className="form-input">
          {shownFormList.map(renderForm)}
          <ReactButton
            title={buttonProps?.title || "Submit"}
            type="submit"
            loading={buttonProps?.loading}
            disabled={
              buttonProps?.disabled ||
              !shownFormList.every((e) => {
                if (e.hide) return true;
                if (!e.rules?.required) return true;

                const val = watch(e.name);
                if (val instanceof Array) return val?.length;

                return val;
              }) ||
              shownFormList.some((e) => !!errors[e.name])
            }
            customClassName={buttonProps?.customClassName}
          />
        </form>
      </div>
    </FormProvider>
  );
};

export default ReactFormBuilder;
