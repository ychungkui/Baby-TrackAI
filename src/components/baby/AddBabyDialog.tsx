import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBabies } from '@/hooks/useBabies'
import { useBabyContext } from '@/contexts/BabyContext'
import { useLanguage } from '@/i18n'
import babyIcon from '@/assets/icons/baby2.png'

interface AddBabyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddBabyDialog({ open, onOpenChange }: AddBabyDialogProps) {
  const { addBaby } = useBabies()
  const { setCurrentBabyId } = useBabyContext()
  const { t } = useLanguage()

  const addBabySchema = z.object({
    name: z.string().min(1, t('baby.nickname_required')),
    birth_date: z.string().min(1, t('baby.birth_required')),
    gender: z.string().optional()
  })

  type V = z.infer<typeof addBabySchema>

  const form = useForm<V>({
    resolver: zodResolver(addBabySchema),
    defaultValues: {
      name: '',
      birth_date: '',
      gender: undefined
    }
  })

  const onSubmit = async (values: V) => {
    try {
      const nb = await addBaby({
        name: values.name,
        birth_date: values.birth_date,
        gender: values.gender
      })

      setCurrentBabyId(nb.id)
      form.reset()
      onOpenChange(false)

    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()} // 🔥 关键：禁止自动 focus → 不弹键盘
        className="
          sm:max-w-md
          max-h-[80vh]
          overflow-y-auto
          p-4
        "
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img src={babyIcon} alt="Baby" className="w-12 h-12" />
            {t('baby.add')}
          </DialogTitle>
        </DialogHeader>

        {/* 🔥 防键盘遮挡 */}
        <div className="space-y-4 pb-24">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('baby.nickname')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('baby.nickname_placeholder')}
                        className="h-12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('baby.birth_date')}</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="h-12"
                        max={new Date().toISOString().split('T')[0]}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('baby.gender')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder={t('baby.select_gender')} />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="male">{t('baby.male')}</SelectItem>
                        <SelectItem value="female">{t('baby.female')}</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 bg-red-500 text-white hover:bg-red-600"
                  onClick={() => onOpenChange(false)}
                >
                  {t('common.cancel')}
                </Button>

                <Button
                  type="submit"
                  className="flex-1 h-12"
                >
                  {t('baby.confirm_add')}
                </Button>
              </div>

            </form>
          </Form>
        </div>

      </DialogContent>
    </Dialog>
  )
}